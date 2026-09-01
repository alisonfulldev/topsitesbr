'use server'

import { prisma } from '@/lib/prisma'
import { getPaymentProvider } from '@/lib/payments/provider'
import { APP_URL } from '@/lib/config'

function slugify(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32)
  const suffix = Math.random().toString(36).substring(2, 6)
  return `${base}-${suffix}`
}

const PLAN_PRICES: Record<string, number> = {
  plano1: 97,
  plano2: 97,
  plano3: 188,
}

const PLAN_LABELS: Record<string, string> = {
  plano1: 'Site — Arquivos HTML',
  plano2: 'Site Essencial — Hospedagem inclusa',
  plano3: 'Site Completo — Hospedagem + Domínio',
}

export async function checkoutAction(
  token: string,
  planChosen: string,
  name: string,
  email: string,
  phone: string,
): Promise<{ error?: string; paymentUrl?: string }> {
  const presentation = await prisma.templatePresentation.findUnique({
    where: { token },
  })

  if (!presentation) return { error: 'Link inválido ou expirado.' }
  if (presentation.status === 'cancelado') return { error: 'Esta apresentação foi cancelada.' }
  if (presentation.status === 'pago') return { error: 'Este site já foi adquirido.' }
  if (!['plano1', 'plano2', 'plano3'].includes(planChosen)) return { error: 'Plano inválido.' }
  if (!name.trim()) return { error: 'Nome é obrigatório.' }
  if (!email.trim() || !email.includes('@')) return { error: 'E-mail inválido.' }

  const price = PLAN_PRICES[planChosen]
  const description = PLAN_LABELS[planChosen]
  const provider = getPaymentProvider()
  const successUrl = `${APP_URL}/modelos/${token}/obrigado`

  let customerId: string
  let chargeId: string
  let paymentUrl: string
  let subdomain: string | undefined

  try {
    const customer = await provider.createCustomer({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || null,
    })
    customerId = customer.customerId
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao processar pagamento'
    return { error: msg }
  }

  try {
    const charge = await provider.createSingleCharge({
      customerId,
      description,
      price,
      successUrl,
    })
    chargeId = charge.chargeId
    paymentUrl = charge.paymentUrl
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao gerar cobrança'
    return { error: msg }
  }

  if (planChosen === 'plano2' || planChosen === 'plano3') {
    subdomain = `${slugify(presentation.leadName)}.topsitebr.com.br`
  }

  await prisma.templatePresentation.update({
    where: { id: presentation.id },
    data: {
      planChosen,
      asaasCustomerId: customerId,
      asaasChargeId: chargeId,
      paymentUrl,
      subdomain: subdomain ?? null,
      leadEmail: email.trim().toLowerCase(),
      leadPhone: phone.trim() || presentation.leadPhone,
    },
  })

  return { paymentUrl }
}
