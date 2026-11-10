import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { SITE_URL } from '@/lib/marketing'
import { ADMIN_NOTIFICATION_EMAIL } from '@/lib/config'
import { sendEmail } from '@/lib/integrations/resend'
import { buildHtml, sendNotification } from '@/lib/notifications'
import { getPaymentProvider } from '@/lib/payments/provider'
import { asaasFetch } from '@/lib/integrations/asaas'
import { hashPassword } from '@/lib/password'
import { generateReferralCode } from '@/lib/referral'
import { validateCpf } from '@/lib/cpf'
import { formatBRL } from '@/lib/monthly-plan'
import { STATUS_LABEL, type ProposalExtra } from './config'
import { ONLINE_CONTRACT_VERSION, buildOnlineContract, contractHash } from './contract'
import { cancelPendingEmails, startSequence } from './sequence'

// ─── Proposta online: prospect → prévia → aprovação → contrato → pagamento → cliente ──

export const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || SITE_URL).replace(/\/$/, '')

export function proposalLink(token: string) {
  return `${BASE_URL}/proposta-online/${token}`
}

export function newToken() {
  return randomBytes(24).toString('base64url')
}

export function parseExtras(value: unknown): ProposalExtra[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((e): e is ProposalExtra => !!e && typeof e === 'object' && typeof (e as ProposalExtra).key === 'string')
    .map((e) => ({ key: e.key, name: String(e.name), price: Number(e.price) || 0 }))
}

export function parseKeys(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((k): k is string => typeof k === 'string') : []
}

type ProposalRow = NonNullable<Awaited<ReturnType<typeof prisma.onlineProposal.findUnique>>>

export function selectedExtrasOf(p: Pick<ProposalRow, 'extras' | 'selectedExtras'>) {
  const keys = parseKeys(p.selectedExtras)
  return parseExtras(p.extras).filter((e) => keys.includes(e.key))
}

export function setupTotal(p: Pick<ProposalRow, 'extras' | 'selectedExtras' | 'setupPrice'>) {
  return Number(p.setupPrice) + selectedExtrasOf(p).reduce((sum, e) => sum + e.price, 0)
}

// Estados em que o prospect ainda está decidindo (a prévia pode expirar)
const OPEN_STATUSES = ['prospect', 'previa_enviada', 'ajuste_solicitado', 'aprovada']

export async function recordEvent(proposalId: string, type: string, detail?: string | null) {
  await prisma.onlineProposalEvent.create({ data: { proposalId, type, detail: detail ?? null } })
}

/** Muda o status, grava no histórico e avisa o admin. */
async function changeStatus(
  p: Pick<ProposalRow, 'id' | 'name' | 'company'>,
  to: string,
  detail?: string | null,
  data: Record<string, unknown> = {},
) {
  await prisma.onlineProposal.update({ where: { id: p.id }, data: { status: to, ...data } })
  await recordEvent(p.id, `status:${to}`, detail)
  const who = p.company ? `${p.name} (${p.company})` : p.name
  await sendNotification(null, `Proposta online — ${who}: ${STATUS_LABEL[to] ?? to}`, detail ?? `A proposta de ${who} mudou para "${STATUS_LABEL[to] ?? to}".`)
}

/** Expira a proposta se o prazo passou (chamado ao abrir o link e no cron). */
export async function expireIfNeeded(p: ProposalRow) {
  if (!OPEN_STATUSES.includes(p.status) || p.expiresAt > new Date()) return p
  await changeStatus(p, 'expirada', 'O prazo do link de proposta terminou.')
  await cancelPendingEmails(p.id, 'expirada')
  return { ...p, status: 'expirada' }
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function sendPreview(proposalId: string) {
  const p = await prisma.onlineProposal.findUniqueOrThrow({ where: { id: proposalId } })
  if (!['prospect', 'ajuste_solicitado', 'previa_enviada'].includes(p.status)) {
    return { error: 'A prévia só pode ser enviada antes da aprovação.' }
  }
  if (!p.previewUrl && !p.previewHtml) return { error: 'Cadastre a prévia (URL ou HTML) antes de enviar.' }
  if (p.expiresAt <= new Date()) return { error: 'O link expirou. Renove o prazo antes de enviar.' }
  const resend = p.status === 'previa_enviada'
  await changeStatus(p, 'previa_enviada', resend ? 'Prévia reenviada ao prospect.' : 'Prévia enviada ao prospect.', {
    previewSentAt: new Date(),
    sequencePaused: false,
  })
  await startSequence(proposalId)
  return {}
}

export async function cancelProposal(proposalId: string) {
  const p = await prisma.onlineProposal.findUniqueOrThrow({ where: { id: proposalId } })
  if (p.status === 'ativo') return { error: 'A proposta já foi paga — gerencie pelo cadastro do cliente.' }
  await changeStatus(p, 'cancelada', 'Proposta cancelada pelo admin.')
  await cancelPendingEmails(p.id, 'cancelada')
  return {}
}

export async function extendExpiration(proposalId: string, days: number) {
  const p = await prisma.onlineProposal.findUniqueOrThrow({ where: { id: proposalId } })
  const base = p.expiresAt > new Date() ? p.expiresAt : new Date()
  const expiresAt = new Date(base.getTime() + days * 86_400_000)
  const reopen = p.status === 'expirada'
  await prisma.onlineProposal.update({ where: { id: p.id }, data: { expiresAt, ...(reopen ? { status: p.previewSentAt ? 'previa_enviada' : 'prospect' } : {}) } })
  await recordEvent(p.id, 'prazo_renovado', `Novo prazo: ${expiresAt.toLocaleDateString('pt-BR')}`)
  return {}
}

// ─── Prospect (link público) ──────────────────────────────────────────────────

export async function findByToken(token: string) {
  const p = await prisma.onlineProposal.findUnique({ where: { token } })
  return p ? expireIfNeeded(p) : null
}

export async function setExtras(token: string, keys: string[]) {
  const p = await findByToken(token)
  if (!p || !['previa_enviada', 'ajuste_solicitado', 'prospect'].includes(p.status)) return { error: 'Esta proposta não pode mais ser alterada.' }
  const offered = parseExtras(p.extras).map((e) => e.key)
  const valid = keys.filter((k) => offered.includes(k))
  await prisma.onlineProposal.update({ where: { id: p.id }, data: { selectedExtras: valid } })
  await recordEvent(p.id, 'extras', valid.length ? `Extras escolhidos: ${valid.join(', ')}` : 'Sem extras')
  return {}
}

export async function approveProposal(token: string) {
  const p = await findByToken(token)
  if (!p || p.status !== 'previa_enviada') return { error: 'Esta prévia não está disponível para aprovação.' }
  const extras = selectedExtrasOf(p)
  await changeStatus(p, 'aprovada', `Prévia aprovada${extras.length ? ` com extras: ${extras.map((e) => e.name).join(', ')}` : ''}. Total do setup: ${formatBRL(setupTotal(p))}.`, { approvedAt: new Date() })
  await cancelPendingEmails(p.id, 'aprovada')
  return {}
}

export async function requestAdjustment(token: string, text: string) {
  const p = await findByToken(token)
  if (!p || p.status !== 'previa_enviada') return { error: 'Esta prévia não está disponível para ajustes.' }
  if (p.revisionsUsed >= p.maxRevisions) return { error: 'O limite de ajustes desta proposta foi atingido. Fale conosco pelo WhatsApp.' }
  const clean = text.trim().slice(0, 3000)
  if (clean.length < 5) return { error: 'Descreva o ajuste que você precisa.' }
  await changeStatus(p, 'ajuste_solicitado', `Ajuste ${p.revisionsUsed + 1}/${p.maxRevisions}: ${clean}`, { revisionsUsed: p.revisionsUsed + 1 })
  await cancelPendingEmails(p.id, 'ajuste_solicitado')
  return {}
}

export async function signContract(
  token: string,
  input: { accepted: boolean; fullName: string; cpf: string },
  meta: { ip: string | null; userAgent: string | null },
) {
  const p = await findByToken(token)
  if (!p || p.status !== 'aprovada') return { error: 'O contrato só pode ser assinado depois da aprovação da prévia.' }
  if (!input.accepted) return { error: 'Marque que leu e concorda com o contrato.' }
  const fullName = input.fullName.trim().replace(/\s+/g, ' ')
  if (fullName.split(' ').length < 2) return { error: 'Informe seu nome completo.' }
  const cpfDigits = input.cpf.replace(/\D/g, '')
  if (!validateCpf(cpfDigits)) return { error: 'CPF inválido.' }

  const signedAt = new Date()
  const content = buildOnlineContract({
    name: fullName,
    company: p.company,
    document: p.document || cpfDigits,
    email: p.email,
    whatsapp: p.whatsapp,
    planKey: p.planKey,
    planName: p.planName,
    setupPrice: Number(p.setupPrice),
    monthlyPrice: Number(p.monthlyPrice),
    extras: selectedExtrasOf(p),
    previewLink: proposalLink(p.token),
    signedAt,
  })
  const hash = contractHash(content)

  await changeStatus(p, 'contrato_assinado', `Contrato assinado por ${fullName} (CPF ${cpfDigits}) — IP ${meta.ip ?? 'não identificado'}.`, {
    signedAt,
    contractVersion: ONLINE_CONTRACT_VERSION,
    contractContent: content,
    contractHash: hash,
    signerName: fullName,
    signerDocument: cpfDigits,
    signerIp: meta.ip,
    signerUserAgent: meta.userAgent?.slice(0, 300) ?? null,
  })

  const when = signedAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  const block = `<div style="margin-top:20px;padding:20px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;line-height:1.6;color:#374151;">${content}<p style="margin-top:16px;font-size:12px;color:#6b7280;">Assinado por ${fullName} (CPF ${cpfDigits}) em ${when}. IP: ${meta.ip ?? 'não identificado'}. Código de verificação (SHA-256): ${hash}</p></div>`
  await sendEmail({
    to: p.email,
    subject: 'Cópia do seu contrato — TopSite',
    html: buildHtml('Cópia do seu contrato', `Olá, ${fullName}! Seu contrato foi assinado em ${when}. Guarde esta cópia. O próximo passo é o pagamento do setup na página da proposta.`, 'proposal-approved', block, proposalLink(p.token), 'Ir para o pagamento'),
  }).catch((err) => console.error('[proposta-online] cópia do contrato (cliente)', err))
  await sendEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: `[TopSite] Contrato assinado — ${fullName}${p.company ? ` (${p.company})` : ''}`,
    html: buildHtml(`Contrato assinado — ${fullName}`, `Plano ${p.planName} · setup ${formatBRL(setupTotal(p))} · ${formatBRL(Number(p.monthlyPrice))}/mês\nIP: ${meta.ip ?? 'não identificado'}\nHash: ${hash}`, 'proposal-approved', block),
  }).catch((err) => console.error('[proposta-online] cópia do contrato (admin)', err))
  return {}
}

/** Gera (ou reaproveita) a cobrança do setup por Pix ou cartão. */
export async function startSetupPayment(token: string, method: 'PIX' | 'CREDIT_CARD') {
  const p = await findByToken(token)
  if (!p || p.status !== 'contrato_assinado') return { error: 'O pagamento fica disponível depois da assinatura do contrato.' }
  if (p.setupChargeId && p.setupPaymentUrl && p.setupPaymentMethod === method) {
    return { paymentUrl: p.setupPaymentUrl }
  }
  const provider = getPaymentProvider()
  const { customerId } = await provider.createCustomer({
    name: p.signerName ?? p.name,
    email: p.email,
    document: p.signerDocument ?? p.document,
    phone: p.whatsapp,
  })
  const extras = selectedExtrasOf(p)
  const charge = await provider.createSingleCharge({
    customerId,
    description: `Setup do site — plano ${p.planName}${extras.length ? ` + ${extras.map((e) => e.name).join(', ')}` : ''}`,
    price: setupTotal(p),
    billingType: method,
    dueInDays: 2,
    externalReference: `online-proposal:${p.id}`,
    successUrl: proposalLink(p.token),
  })
  await prisma.onlineProposal.update({
    where: { id: p.id },
    data: { setupChargeId: charge.chargeId, setupPaymentUrl: charge.paymentUrl, setupPaymentMethod: method },
  })
  await recordEvent(p.id, 'pagamento_gerado', `Cobrança do setup (${method === 'PIX' ? 'Pix' : 'cartão'}) — ${formatBRL(setupTotal(p))}`)
  return { paymentUrl: charge.paymentUrl }
}

/** Confere no Asaas se o setup já foi pago (webhook atrasado ou retorno do checkout). */
export async function syncSetupPayment(token: string) {
  const p = await prisma.onlineProposal.findUnique({ where: { token } })
  if (!p?.setupChargeId || p.status !== 'contrato_assinado' || process.env.PAYMENT_DRIVER !== 'asaas') return false
  try {
    const charge = await asaasFetch<{ status: string }>(`/payments/${p.setupChargeId}`)
    if (['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'].includes(charge.status)) {
      await activateOnlineProposal(p.id, p.setupChargeId)
      return true
    }
  } catch {
    /* sem conexão com o Asaas: o webhook confirma depois */
  }
  return false
}

// ─── Pagamento confirmado: prospect vira cliente ──────────────────────────────

const ADMIN_CHECKLIST = `Checklist de publicação:
[ ] Conferir o briefing enviado pelo cliente
[ ] Domínio: próprio (registrar/configurar — R$ 91/ano) ou endereço alternativo do GitHub
[ ] DNS apontado e SSL ativo
[ ] Versão final publicada e enviada para revisão do cliente
[ ] Marcar o site como "online" após a aprovação`

/** Setup pago: cria cliente, login, assinatura (1ª mensalidade em 30 dias) e projeto no fluxo de produção. Idempotente. */
export async function activateOnlineProposal(proposalId: string, chargeId: string | null) {
  const claimed = await prisma.onlineProposal.updateMany({
    where: { id: proposalId, status: 'contrato_assinado' },
    data: { status: 'ativo', paidAt: new Date() },
  })
  if (claimed.count === 0) return { ok: true, message: 'Proposta online já ativada.' }

  const p = await prisma.onlineProposal.findUniqueOrThrow({ where: { id: proposalId } })
  const now = new Date()
  const total = setupTotal(p)
  const monthly = Number(p.monthlyPrice)
  const name = p.signerName ?? p.name

  // Cliente (reaproveita se o e-mail já existir)
  let client = await prisma.client.findUnique({ where: { email: p.email.toLowerCase() } })
  if (!client) {
    client = await prisma.client.create({
      data: {
        name,
        email: p.email.toLowerCase(),
        phone: p.whatsapp,
        document: p.signerDocument ?? p.document,
        referralCode: generateReferralCode(name),
        entryFlow: 'proposta',
        activationFlow: 'quente',
        monthlyPrice: monthly,
        siteEntryFee: total,
        monthlyFeeAcknowledgedAt: p.signedAt ?? now,
      },
    })
  }
  await prisma.client.update({
    where: { id: client.id },
    data: {
      termsAcceptedAt: p.signedAt ?? now,
      termsVersion: p.contractVersion ?? ONLINE_CONTRACT_VERSION,
      ...(client.document ? {} : { document: p.signerDocument }),
    },
  })

  // Contrato assinado no cadastro do cliente (comprovante no admin)
  if (p.contractContent) {
    await prisma.contractAcceptance.create({
      data: {
        clientId: client.id,
        version: p.contractVersion ?? ONLINE_CONTRACT_VERSION,
        content: `${p.contractContent}<p style="margin-top:16px;font-size:12px;color:#6b7280;">Assinado por ${p.signerName} (CPF ${p.signerDocument}). Código de verificação (SHA-256): ${p.contractHash}</p>`,
        acceptedAt: p.signedAt ?? now,
        ipAddress: p.signerIp,
        userAgent: p.signerUserAgent,
      },
    })
  }

  // Login de acesso ao painel
  let tempPassword: string | null = null
  const existingUser = await prisma.user.findUnique({ where: { email: client.email } })
  if (!existingUser) {
    tempPassword = randomBytes(6).toString('base64url')
    await prisma.user.create({
      data: { name, email: client.email, passwordHash: await hashPassword(tempPassword), role: 'client', clientId: client.id, mustChangePassword: true },
    })
  }

  // Receita do setup (financeiro)
  const productName = 'Setup — proposta online'
  const product =
    (await prisma.product.findFirst({ where: { name: productName } })) ??
    (await prisma.product.create({ data: { name: productName, price: 0, type: 'service' } }))
  const order = await prisma.order.create({
    data: { clientId: client.id, productId: product.id, amount: total, status: 'paid', asaasChargeId: chargeId },
  })

  // Mensalidade: só Pix, 1º vencimento em 30 dias (o cron gera o Pix com débito automático)
  const plan = await prisma.plan.findFirst({ where: { name: 'Site no Ar' } })
  if (plan) {
    await prisma.subscription.create({
      data: { clientId: client.id, planId: plan.id, status: 'active', customPrice: monthly, nextDueDate: new Date(now.getTime() + 30 * 86_400_000), planActivatedAt: now },
    })
  }

  // Projeto no fluxo de produção: briefing → desenvolvimento → revisão → publicado
  await prisma.proposal.create({
    data: {
      clientId: client.id,
      title: `Site de ${p.company || name}`,
      description: `Proposta online — plano ${p.planName}`,
      includedItems: selectedExtrasOf(p).map((e) => e.name).join('\n') || null,
      creationPrice: total,
      status: 'aguardando_info',
      paidAt: now,
      orderId: order.id,
      contractAcceptedAt: p.signedAt,
      contractVersion: p.contractVersion,
      contractAcceptedIp: p.signerIp,
    },
  })

  await prisma.onlineProposal.update({ where: { id: p.id }, data: { clientId: client.id } })
  await recordEvent(p.id, 'status:ativo', `Setup pago (${formatBRL(total)}). Cliente criado/vinculado.`)
  await cancelPendingEmails(p.id, 'ativo')

  await sendNotification(null, `Proposta online paga — ${p.company || name}`, `Setup de ${formatBRL(total)} pago. Mensalidade ${formatBRL(monthly)} por Pix (1º vencimento em 30 dias).\n\n${ADMIN_CHECKLIST}`)

  const appUrl = BASE_URL
  await sendEmail({
    to: client.email,
    subject: 'Pagamento confirmado — próximos passos do seu site',
    html: buildHtml(
      'Pagamento confirmado!',
      `Olá, ${name}! Recebemos o pagamento do setup. Agora acesse o painel e envie as informações do seu negócio para começarmos a versão final do seu site.${tempPassword ? `\n\nE-mail de acesso: ${client.email}\nSenha temporária: ${tempPassword}` : ''}`,
      'payment-confirmed',
      undefined,
      `${appUrl}/login`,
      'Acessar o painel',
    ),
  }).catch((err) => console.error('[proposta-online] e-mail de acesso', err))

  return { ok: true, message: `Proposta online de ${name} ativada.` }
}
