import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fakeAsaas, fakeAsaasModule } from '../helpers/fake-asaas'
import { client, days, plan, ymd } from '../helpers/factories'

vi.mock('@/lib/integrations/asaas', () => fakeAsaasModule())

const { handlePaymentReceived, handlePaymentOverdue, checkOverdueSubscriptions } = await import('@/lib/payments/webhook-handlers')
const { POST } = await import('@/app/api/webhooks/asaas/route')

// Assinatura antiga do Asaas com faturas locais vinculadas às cobranças do Asaas falso
async function legacySubscription(opts: { invoices: { due: Date; status: 'pending' | 'paid' | 'overdue'; asaas: string }[]; status?: 'active' | 'overdue'; nextDue?: Date }) {
  const p = await plan()
  const c = await client()
  const asaasSub = fakeAsaas.addSubscription({ customer: 'cus_x', value: 29, nextDueDate: ymd(days(30)) })
  const sub = await prisma.subscription.create({
    data: { clientId: c.id, planId: p.id, status: opts.status ?? 'active', asaasSubscriptionId: asaasSub.id, nextDueDate: opts.nextDue ?? opts.invoices[0]?.due },
  })
  const charges = []
  for (const inv of opts.invoices) {
    const pay = fakeAsaas.addPayment({ customer: 'cus_x', subscription: asaasSub.id, status: inv.asaas, value: 29, dueDate: ymd(inv.due) })
    await prisma.invoice.create({ data: { subscriptionId: sub.id, amount: 29, status: inv.status, dueDate: inv.due, asaasChargeId: pay.id, ...(inv.status === 'paid' ? { paidAt: new Date() } : {}) } })
    charges.push(pay)
  }
  return { client: c, sub, asaasSub, charges }
}

const countNotifs = (clientId: string) => prisma.notification.count({ where: { clientId } })

function webhook(body: unknown) {
  return POST(new NextRequest('https://topsitebr.com.br/api/webhooks/asaas', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }))
}

beforeEach(() => fakeAsaas.reset())

describe('PAYMENT_RECEIVED', () => {
  it('marca a fatura como paga, ativa a assinatura e avança o vencimento', async () => {
    const due = days(1)
    const { sub, charges } = await legacySubscription({ invoices: [{ due, status: 'pending', asaas: 'RECEIVED' }] })
    const r = await handlePaymentReceived(charges[0].id)
    expect(r.ok).toBe(true)
    const after = await prisma.subscription.findUniqueOrThrow({ where: { id: sub.id } })
    expect(after.status).toBe('active')
    expect(after.nextDueDate!.getMonth()).toBe((due.getMonth() + 1) % 12)
    expect((await prisma.invoice.findFirstOrThrow({ where: { asaasChargeId: charges[0].id } })).status).toBe('paid')
  })

  it('é idempotente: webhook repetido não notifica de novo', async () => {
    const { client: c, charges } = await legacySubscription({ invoices: [{ due: days(1), status: 'pending', asaas: 'RECEIVED' }] })
    await handlePaymentReceived(charges[0].id)
    const before = await countNotifs(c.id)
    await handlePaymentReceived(charges[0].id)
    expect(await countNotifs(c.id)).toBe(before)
  })

  it('pagar a cobrança futura (caso Del/Air) não esconde a cobrança vencida anterior', async () => {
    const { sub, charges } = await legacySubscription({
      status: 'overdue',
      invoices: [
        { due: days(-5), status: 'overdue', asaas: 'OVERDUE' },
        { due: days(25), status: 'pending', asaas: 'RECEIVED' },
      ],
    })
    await handlePaymentReceived(charges[1].id)
    expect((await prisma.subscription.findUniqueOrThrow({ where: { id: sub.id } })).status).toBe('overdue')
  })

  it('cobrança avulsa (Order) paga é idempotente', async () => {
    const c = await client()
    const product = await prisma.product.create({ data: { name: 'Logo', price: 100, type: 'service' } })
    const pay = fakeAsaas.addPayment({ customer: 'cus_y', status: 'RECEIVED', value: 100, dueDate: ymd(days(2)) })
    await prisma.order.create({ data: { clientId: c.id, productId: product.id, amount: 100, status: 'pending', asaasChargeId: pay.id } })
    await handlePaymentReceived(pay.id)
    const before = await countNotifs(c.id)
    await handlePaymentReceived(pay.id)
    expect(await countNotifs(c.id)).toBe(before)
  })
})

describe('PAYMENT_OVERDUE', () => {
  it('marca a fatura e a assinatura como em atraso', async () => {
    const { sub, charges } = await legacySubscription({ invoices: [{ due: days(-1), status: 'pending', asaas: 'OVERDUE' }] })
    await handlePaymentOverdue(charges[0].id)
    expect((await prisma.subscription.findUniqueOrThrow({ where: { id: sub.id } })).status).toBe('overdue')
  })

  it('não volta para "em atraso" uma fatura que já está paga', async () => {
    const { sub, charges } = await legacySubscription({ invoices: [{ due: days(-1), status: 'paid', asaas: 'OVERDUE' }] })
    await handlePaymentOverdue(charges[0].id)
    expect((await prisma.invoice.findFirstOrThrow({ where: { asaasChargeId: charges[0].id } })).status).toBe('paid')
    expect((await prisma.subscription.findUniqueOrThrow({ where: { id: sub.id } })).status).toBe('active')
  })

  it('webhook de atraso repetido não reenvia o aviso', async () => {
    const { client: c, charges } = await legacySubscription({ invoices: [{ due: days(-1), status: 'pending', asaas: 'OVERDUE' }] })
    await handlePaymentOverdue(charges[0].id)
    const before = await countNotifs(c.id)
    await handlePaymentOverdue(charges[0].id)
    expect(await countNotifs(c.id)).toBe(before)
  })

  it('avisos de dia 5/10 ignoram assinaturas canceladas', async () => {
    const { client: c, sub } = await legacySubscription({ status: 'overdue', invoices: [{ due: days(-12), status: 'overdue', asaas: 'OVERDUE' }] })
    await prisma.subscription.update({ where: { id: sub.id }, data: { status: 'canceled' } })
    await checkOverdueSubscriptions()
    const adminNotifs = await prisma.notification.count({ where: { clientId: null, title: { contains: c.name } } })
    expect(adminNotifs).toBe(0)
  })
})

describe('rota do webhook (segurança)', () => {
  it('ignora PAYMENT_RECEIVED forjado: a cobrança não está paga no Asaas', async () => {
    const { charges } = await legacySubscription({ invoices: [{ due: days(1), status: 'pending', asaas: 'PENDING' }] })
    await webhook({ event: 'PAYMENT_RECEIVED', payment: { id: charges[0].id } })
    expect((await prisma.invoice.findFirstOrThrow({ where: { asaasChargeId: charges[0].id } })).status).toBe('pending')
  })

  it('processa PAYMENT_RECEIVED quando o Asaas confirma o pagamento', async () => {
    const { charges } = await legacySubscription({ invoices: [{ due: days(1), status: 'pending', asaas: 'RECEIVED' }] })
    await webhook({ event: 'PAYMENT_RECEIVED', payment: { id: charges[0].id } })
    expect((await prisma.invoice.findFirstOrThrow({ where: { asaasChargeId: charges[0].id } })).status).toBe('paid')
  })
})
