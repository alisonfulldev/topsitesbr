'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPaymentProvider } from '@/lib/payments/provider'
import { sendNotification } from '@/lib/notifications'
import { DOMAIN_ANNUAL_PRICE, earlyTerminationQuote, formatBRL, subscriptionPrice } from '@/lib/monthly-plan'

// Cobranças avulsas do plano mensal, sempre por Pix: quitação da fidelidade e domínio anual.

async function assertAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user.role === 'admin'
}

async function findOrCreateProduct(name: string) {
  const existing = await prisma.product.findFirst({ where: { name } })
  return existing ?? prisma.product.create({ data: { name, price: 0, type: 'service' } })
}

async function createPixOrder(clientId: string, productName: string, amount: number, description: string) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, email: true, document: true, phone: true, asaasCustomerId: true },
  })
  if (!client) return { error: 'Cliente não encontrado.' }

  const provider = getPaymentProvider()
  const customerId =
    client.asaasCustomerId ??
    (await provider.createCustomer({ name: client.name, email: client.email, document: client.document, phone: client.phone })).customerId
  if (!client.asaasCustomerId) {
    await prisma.client.update({ where: { id: clientId }, data: { asaasCustomerId: customerId } })
  }

  const product = await findOrCreateProduct(productName)
  // Quitação: vencimento em até 5 dias (cláusula 6.3 do contrato)
  const charge = await provider.createSingleCharge({
    customerId,
    description,
    price: amount,
    billingType: 'PIX',
    dueInDays: 5,
  })
  await prisma.order.create({
    data: { clientId, productId: product.id, amount, status: 'pending', asaasChargeId: charge.chargeId },
  })

  await sendNotification(
    clientId,
    description,
    `Geramos a cobrança de ${formatBRL(amount)} por Pix, com vencimento em 5 dias. Pague pelo link: ${charge.paymentUrl}`,
    'email',
    'charge-created',
  )

  revalidatePath(`/admin/clientes/${clientId}`)
  return { paymentUrl: charge.paymentUrl }
}

/** Quitação antecipada: mensalidades restantes da fidelidade + 2%. */
export async function createEarlyTerminationChargeAction(clientId: string): Promise<{ error?: string; paymentUrl?: string; total?: number }> {
  if (!(await assertAdmin())) return { error: 'Não autorizado.' }
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { clientId, customPrice: { not: null }, status: { not: 'canceled' } },
      include: { plan: true, invoices: { where: { status: 'paid' }, select: { id: true } } },
      orderBy: { createdAt: 'desc' },
    })
    if (!subscription) return { error: 'Cliente sem assinatura do plano mensal.' }

    const quote = earlyTerminationQuote({
      monthlyPrice: subscriptionPrice(subscription),
      paidMonths: subscription.invoices.length,
      fidelityEndsAt: subscription.fidelityEndsAt,
    })
    if (!quote.inFidelity || quote.total <= 0) {
      return { error: 'A fidelidade já foi cumprida: o encerramento não tem multa.' }
    }

    const result = await createPixOrder(
      clientId,
      'Quitação de fidelidade (plano mensal)',
      quote.total,
      `Quitação do contrato — ${quote.remainingMonths} mensalidade(s) + 2%`,
    )
    return { ...result, total: quote.total }
  } catch (err) {
    console.error('[mensal] erro ao gerar quitação', err)
    return { error: err instanceof Error ? err.message : 'Erro ao gerar a cobrança.' }
  }
}

/** Assinatura antiga → Pix Automático já (teste com 1 cliente antes de ligar a migração automática). */
export async function migrateClientToPixAction(clientId: string): Promise<{ error?: string; message?: string }> {
  if (!(await assertAdmin())) return { error: 'Não autorizado.' }
  try {
    const sub = await prisma.subscription.findFirst({
      where: { clientId, status: { not: 'canceled' } },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    })
    if (!sub) return { error: 'Cliente sem assinatura.' }
    const { migrateToPixAutomatic, processPixAutomaticCycles } = await import('@/lib/monthly-plan-service')
    const r = await migrateToPixAutomatic(sub.id)
    if (!r.migrated) return { error: r.reason ?? 'Não foi possível migrar agora.' }
    // Se a mensalidade vence em até 5 dias, o Pix já é gerado agora
    await processPixAutomaticCycles()
    revalidatePath(`/admin/clientes/${clientId}`)
    return { message: 'Migrado. O Pix da próxima mensalidade é gerado 5 dias antes do vencimento e o cliente foi avisado por e-mail.' }
  } catch (err) {
    console.error('[pix] erro ao migrar cliente', err)
    return { error: err instanceof Error ? err.message : 'Erro ao migrar.' }
  }
}

/** Domínio próprio (opcional): R$ 90 por ano, por Pix (cláusula 4.2 do contrato mensal). */
export async function createDomainChargeAction(clientId: string): Promise<{ error?: string; paymentUrl?: string }> {
  if (!(await assertAdmin())) return { error: 'Não autorizado.' }
  try {
    return await createPixOrder(clientId, 'Domínio próprio (anual)', DOMAIN_ANNUAL_PRICE, 'Domínio próprio — 1 ano')
  } catch (err) {
    console.error('[mensal] erro ao gerar cobrança de domínio', err)
    return { error: err instanceof Error ? err.message : 'Erro ao gerar a cobrança.' }
  }
}
