'use server'

import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getPaymentProvider } from '@/lib/payments/provider'
import { validateDocument } from '@/lib/cpf'
import { sendPresentationGateEmail } from '@/lib/emails/presentation'
import { sendEmail } from '@/lib/integrations/resend'
import { APP_URL, ADMIN_NOTIFICATION_EMAIL } from '@/lib/config'

const PRESENTATION_TERMS_VERSION = 'apresentacao-1.0'

function slugify(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32)
  return `${base}-${Math.random().toString(36).substring(2, 6)}`
}

const PLAN_PRICES: Record<string, number> = { plano1: 97, plano2: 97, plano3: 188 }
const PLAN_LABELS: Record<string, string> = {
  plano1: 'Site — Arquivos HTML',
  plano2: 'Site Essencial — Hospedagem inclusa',
  plano3: 'Site Completo — Hospedagem + Domínio',
}

export async function captureEmailAction(
  token: string,
  email: string,
): Promise<{ error?: string; ok?: boolean }> {
  const presentation = await prisma.templatePresentation.findUnique({ where: { token } })
  if (!presentation || presentation.status === 'cancelado') return { error: 'Link inválido.' }
  if (!email.trim() || !email.includes('@')) return { error: 'E-mail inválido.' }

  const normalEmail = email.trim().toLowerCase()
  const alreadyCaptured = presentation.leadEmail?.toLowerCase() === normalEmail

  if (!alreadyCaptured) {
    await prisma.templatePresentation.update({
      where: { id: presentation.id },
      data: { leadEmail: normalEmail },
    })
  }

  // Fire-and-forget — email failure doesn't block the lead
  console.log('[gate-email] disparando para', normalEmail)
  sendPresentationGateEmail(
    normalEmail,
    `${APP_URL}/modelos/${token}`,
    presentation.leadPersonName ?? presentation.leadName,
  ).catch((err) => console.error('[gate-email] FALHA:', err))

  return { ok: true }
}

export async function checkoutAction(
  token: string,
  name: string,
  email: string,
  phone: string,
  document: string,
  termsAccepted: boolean,
): Promise<{ error?: string; paymentUrl?: string }> {
  if (!termsAccepted) return { error: 'Você precisa aceitar os Termos de Uso para continuar.' }

  const presentation = await prisma.templatePresentation.findUnique({ where: { token } })

  if (!presentation) return { error: 'Link inválido ou expirado.' }
  if (presentation.status === 'cancelado') return { error: 'Esta apresentação foi cancelada.' }
  if (presentation.status === 'pago') return { error: 'Este site já foi adquirido.' }
  if (!name.trim()) return { error: 'Nome é obrigatório.' }
  if (!email.trim() || !email.includes('@')) return { error: 'E-mail inválido.' }

  const docClean = document.replace(/\D/g, '')
  if (!validateDocument(docClean)) {
    return { error: 'CPF ou CNPJ inválido. Verifique os dígitos informados.' }
  }

  const hdrs = headers()
  const ip =
    hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    hdrs.get('x-real-ip') ??
    'unknown'

  const now = new Date()
  const provider = getPaymentProvider()
  const successUrl = `${APP_URL}/modelos/${token}/obrigado`

  let customerId: string
  let chargeId: string
  let paymentUrl: string

  try {
    const customer = await provider.createCustomer({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || null,
      document: docClean,
    })
    customerId = customer.customerId
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao processar pagamento.' }
  }

  try {
    const charge = await provider.createSingleCharge({
      customerId,
      description: PLAN_LABELS['plano1'],
      price: PLAN_PRICES['plano1'],
      successUrl,
    })
    chargeId = charge.chargeId
    paymentUrl = charge.paymentUrl
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao gerar cobrança.' }
  }

  await prisma.templatePresentation.update({
    where: { id: presentation.id },
    data: {
      planChosen: 'plano1',
      asaasCustomerId: customerId,
      asaasChargeId: chargeId,
      paymentUrl,
      leadPersonName: name.trim(),
      leadEmail: email.trim().toLowerCase(),
      leadPhone: phone.trim() || presentation.leadPhone,
      leadDocument: docClean,
      termsAcceptedAt: now,
      termsVersion: PRESENTATION_TERMS_VERSION,
      termsAcceptedIp: ip,
    },
  })

  // Notifica admin com prova de aceite — fire-and-forget
  sendEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: `[TopSite] Aceite de termos — ${name.trim()}`,
    html: `<p><strong>Lead:</strong> ${name.trim()}<br>
<strong>E-mail:</strong> ${email.trim().toLowerCase()}<br>
<strong>Data/hora:</strong> ${now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}<br>
<strong>IP:</strong> ${ip}<br>
<strong>Versão dos termos:</strong> ${PRESENTATION_TERMS_VERSION}<br>
<strong>Apresentação:</strong> ${token}</p>`,
  }).catch((err) => console.error('[terms-email] FALHA:', err))

  return { paymentUrl }
}

export async function chooseTemplateAction(
  token: string,
  templateNum: number,
): Promise<{ ok?: boolean; error?: string }> {
  const presentation = await prisma.templatePresentation.findUnique({ where: { token } })
  if (!presentation || presentation.status === 'cancelado') return { error: 'Link inválido.' }

  await prisma.templatePresentation.update({
    where: { id: presentation.id },
    data: { chosenTemplate: templateNum },
  })

  return { ok: true }
}
