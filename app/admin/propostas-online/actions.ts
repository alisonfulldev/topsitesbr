'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateDocument } from '@/lib/cpf'
import { EXTRA_PRESETS, PLAN_PRESETS, saveOnlineProposalConfig } from '@/lib/online-proposal/config'
import { cancelProposal, extendExpiration, newToken, proposalLink, recordEvent, sendPreview } from '@/lib/online-proposal/service'
import { resendEmail, setSequencePaused } from '@/lib/online-proposal/sequence'

type Result = { error?: string; id?: string; link?: string }

async function isAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user.role === 'admin'
}

const MAX_HTML_BYTES = 3 * 1024 * 1024

function money(raw: FormDataEntryValue | null) {
  const n = parseFloat(String(raw ?? '').replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : NaN
}

async function readPreview(formData: FormData) {
  const previewUrl = String(formData.get('previewUrl') ?? '').trim() || null
  const file = formData.get('previewFile')
  let previewHtml: string | null = null
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_HTML_BYTES) return { error: 'O HTML da prévia deve ter no máximo 3 MB.' }
    previewHtml = await file.text()
  }
  if (previewUrl && !/^https:\/\//i.test(previewUrl)) return { error: 'A URL da prévia deve começar com https://' }
  return { previewUrl, previewHtml }
}

export async function createOnlineProposalAction(formData: FormData): Promise<Result> {
  if (!(await isAdmin())) return { error: 'Não autorizado.' }

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const document = String(formData.get('document') ?? '').trim()
  const planKey = String(formData.get('planKey') ?? '')
  const preset = PLAN_PRESETS.find((p) => p.key === planKey)
  const setupPrice = money(formData.get('setupPrice'))
  const monthlyPrice = money(formData.get('monthlyPrice'))
  const expiresInDays = parseInt(String(formData.get('expiresInDays') ?? '15'), 10)
  const maxRevisions = parseInt(String(formData.get('maxRevisions') ?? '2'), 10)

  if (!name) return { error: 'Informe o nome.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Informe um e-mail válido.' }
  if (document && !validateDocument(document)) return { error: 'CPF/CNPJ inválido.' }
  if (!preset) return { error: 'Escolha o plano.' }
  if (Number.isNaN(setupPrice) || Number.isNaN(monthlyPrice) || monthlyPrice <= 0) return { error: 'Informe valores válidos para o setup e a mensalidade.' }
  if (!(expiresInDays >= 1 && expiresInDays <= 90)) return { error: 'A expiração deve ficar entre 1 e 90 dias.' }
  if (!(maxRevisions >= 0 && maxRevisions <= 10)) return { error: 'Limite de ajustes entre 0 e 10.' }

  const preview = await readPreview(formData)
  if ('error' in preview) return { error: preview.error }

  // Extras oferecidos: os marcados no cadastro, com o valor (editável) informado
  const extras = EXTRA_PRESETS.filter((e) => formData.get(`extra_${e.key}`) === 'on').map((e) => {
    const price = money(formData.get(`extraPrice_${e.key}`))
    return { key: e.key, name: e.name, price: Number.isNaN(price) ? e.price : price }
  })

  const proposal = await prisma.onlineProposal.create({
    data: {
      token: newToken(),
      name,
      company: String(formData.get('company') ?? '').trim() || null,
      document: document || null,
      email,
      whatsapp: String(formData.get('whatsapp') ?? '').trim() || null,
      planKey: preset.key,
      planName: preset.name,
      setupPrice,
      monthlyPrice,
      extras,
      previewUrl: preview.previewUrl,
      previewHtml: preview.previewHtml,
      maxRevisions,
      expiresAt: new Date(Date.now() + expiresInDays * 86_400_000),
    },
  })
  await recordEvent(proposal.id, 'status:prospect', 'Proposta cadastrada.')
  revalidatePath('/admin/propostas-online')
  return { id: proposal.id, link: proposalLink(proposal.token) }
}

/** Troca a prévia (nova versão depois de um ajuste) — reenviar dispara uma nova sequência. */
export async function updatePreviewAction(id: string, formData: FormData): Promise<Result> {
  if (!(await isAdmin())) return { error: 'Não autorizado.' }
  const preview = await readPreview(formData)
  if ('error' in preview) return { error: preview.error }
  if (!preview.previewUrl && !preview.previewHtml) return { error: 'Informe a URL ou envie o HTML da nova prévia.' }
  await prisma.onlineProposal.update({ where: { id }, data: { previewUrl: preview.previewUrl, previewHtml: preview.previewHtml } })
  await recordEvent(id, 'previa_atualizada', preview.previewHtml ? 'Nova prévia (HTML) carregada.' : `Nova prévia: ${preview.previewUrl}`)
  revalidatePath(`/admin/propostas-online/${id}`)
  return {}
}

async function adminRun(id: string, fn: () => Promise<unknown>): Promise<Result> {
  if (!(await isAdmin())) return { error: 'Não autorizado.' }
  try {
    const r = (await fn()) as Result | undefined
    revalidatePath(`/admin/propostas-online/${id}`)
    revalidatePath('/admin/propostas-online')
    return r && typeof r === 'object' && 'error' in r ? r : {}
  } catch (err) {
    console.error('[admin/propostas-online]', err)
    return { error: err instanceof Error ? err.message : 'Erro inesperado.' }
  }
}

export async function sendPreviewAction(id: string) {
  return adminRun(id, () => sendPreview(id))
}
export async function cancelProposalAction(id: string) {
  return adminRun(id, () => cancelProposal(id))
}
export async function extendExpirationAction(id: string, days: number) {
  return adminRun(id, () => extendExpiration(id, days))
}
export async function setSequencePausedAction(id: string, paused: boolean) {
  return adminRun(id, () => setSequencePaused(id, paused))
}
export async function resendEmailAction(proposalId: string, emailId: string) {
  return adminRun(proposalId, () => resendEmail(emailId))
}

export async function saveConfigAction(config: unknown): Promise<Result> {
  if (!(await isAdmin())) return { error: 'Não autorizado.' }
  const r = await saveOnlineProposalConfig(config)
  revalidatePath('/admin/propostas-online/configuracoes')
  return r
}
