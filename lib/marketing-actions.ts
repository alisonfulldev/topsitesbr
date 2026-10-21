'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/integrations/resend'
import { ADMIN_NOTIFICATION_EMAIL } from '@/lib/config'
import { buildHtml } from '@/lib/notifications'
import { SITE_TYPES } from '@/lib/marketing'

// Ações públicas da home (formulário de contato e newsletter).
// Anti-spam: campo isca (honeypot) + tempo mínimo de preenchimento.
// Quando um robô cai na isca, devolvemos "ok" sem salvar nada para não ensiná-lo a contornar.

export type FormResult = { ok: true } | { ok: false; error: string }

const MIN_FILL_MS = 2500

function looksLikeBot(honeypot: string | undefined, startedAt: number | undefined) {
  if (honeypot) return true
  return !startedAt || Date.now() - startedAt < MIN_FILL_MS
}

const contactSchema = z.object({
  name: z.string().trim().min(3).max(120),
  email: z.string().trim().toLowerCase().email().max(160),
  // Aceita números brasileiros e internacionais: 10 a 15 dígitos
  phone: z.string().trim().max(25).refine((value) => {
    const digits = value.replace(/\D/g, '')
    return digits.length >= 10 && digits.length <= 15
  }),
  siteType: z.enum(SITE_TYPES),
  message: z.string().trim().min(10).max(2000),
  website: z.string().optional(),
  startedAt: z.number().optional(),
})

export type ContactInput = z.input<typeof contactSchema>

export async function requestContactAction(input: ContactInput): Promise<FormResult> {
  const parsed = contactSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid' }
  const { name, email, phone, siteType, message, website, startedAt } = parsed.data
  if (looksLikeBot(website, startedAt)) return { ok: true }

  const title = 'Novo pedido de contato: ' + name
  const body = ['Nome: ' + name, 'E-mail: ' + email, 'Telefone/WhatsApp: ' + phone, 'Tipo de site: ' + siteType, '', message].join('\n')

  // O pedido só é confirmado ao visitante depois de salvo no banco.
  // O registro fica em contact_requests (aba Site); a notificação é só o aviso no sininho.
  try {
    await prisma.$transaction([
      prisma.contactRequest.create({ data: { name, email, phone, siteType, message } }),
      prisma.notification.create({ data: { clientId: null, title, message: siteType + ' · ' + phone + '\nDetalhes em Admin → Site.', channel: 'painel' } }),
    ])
  } catch (err) {
    console.error('[contato] db save failed', err)
    return { ok: false, error: 'server_error' }
  }

  // E-mail ao admin é complementar: o pedido já está em /admin/site
  try {
    await sendEmail({ to: ADMIN_NOTIFICATION_EMAIL, subject: title, html: buildHtml(title, body, 'generic') })
  } catch (err) {
    console.error('[contato] email failed', err)
  }

  return { ok: true }
}

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(160),
  consent: z.literal(true),
  website: z.string().optional(),
  startedAt: z.number().optional(),
})

export type NewsletterInput = z.input<typeof newsletterSchema>

export async function subscribeNewsletterAction(input: NewsletterInput): Promise<FormResult> {
  const parsed = newsletterSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid' }
  const { email, website, startedAt } = parsed.data
  if (looksLikeBot(website, startedAt)) return { ok: true }

  try {
    const existing = await prisma.lead.findFirst({ where: { email, source: 'newsletter' }, select: { id: true } })
    if (!existing) await prisma.lead.create({ data: { name: '', email, source: 'newsletter' } })
    // Nova inscrição com consentimento explícito desfaz um descadastro anterior
    await prisma.emailOptOut.deleteMany({ where: { email } })
  } catch (err) {
    console.error('[newsletter] db save failed', err)
    return { ok: false, error: 'server_error' }
  }

  return { ok: true }
}
