import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { fakeAsaas, fakeAsaasModule } from '../helpers/fake-asaas'
import { client, days, plan, ymd } from '../helpers/factories'

vi.mock('@/lib/integrations/asaas', () => fakeAsaasModule())

const svc = await import('@/lib/monthly-plan-service')
const { confirmManualPayment } = await import('@/app/admin/clientes/[id]/assinatura/actions')

beforeEach(() => fakeAsaas.reset())

// Assinatura do fluxo novo (Pix Automático, sem assinatura comum no Asaas)
async function pixSubscription(dueInDays: number, price = 29) {
  const p = await plan()
  const c = await client({ monthlyPrice: price })
  const sub = await prisma.subscription.create({
    data: { clientId: c.id, planId: p.id, status: 'active', customPrice: price, nextDueDate: days(dueInDays) },
  })
  return { client: c, sub }
}

const reload = (id: string) => prisma.subscription.findUniqueOrThrow({ where: { id }, include: { invoices: true } })

describe('ciclo da mensalidade por Pix Automático', () => {
  it('5 dias antes do vencimento gera o Pix, a fatura e o e-mail com o link de pagamento', async () => {
    const { client: c, sub } = await pixSubscription(3)
    const r = await svc.processPixAutomaticCycles()
    expect(r.created).toBe(1)
    const after = await reload(sub.id)
    expect(after.pixAutomaticAuthorizationId).toBeTruthy()
    expect(after.invoices).toHaveLength(1)
    expect(after.invoices[0].status).toBe('pending')
    const notif = await prisma.notification.findFirstOrThrow({ where: { clientId: c.id } })
    expect(notif.message).toContain('/pagar/')
    expect(notif.message).not.toContain('localhost')
  })

  it('não gera o Pix antes da janela de 5 dias nem duas vezes', async () => {
    const { sub } = await pixSubscription(20)
    await svc.processPixAutomaticCycles()
    expect((await reload(sub.id)).pixAutomaticAuthorizationId).toBeNull()

    await prisma.subscription.update({ where: { id: sub.id }, data: { nextDueDate: days(2) } })
    await svc.processPixAutomaticCycles()
    await svc.processPixAutomaticCycles()
    expect(fakeAsaas.authorizations.size).toBe(1)
    expect((await reload(sub.id)).invoices).toHaveLength(1)
  })

  it('vencimento sem pagamento: fatura e assinatura em atraso, sem aviso duplicado', async () => {
    const { client: c, sub } = await pixSubscription(2)
    await svc.processPixAutomaticCycles()
    await prisma.invoice.updateMany({ where: { subscriptionId: sub.id }, data: { dueDate: days(-1) } })
    await prisma.subscription.update({ where: { id: sub.id }, data: { nextDueDate: days(-1) } })
    await svc.processPixAutomaticCycles()
    const after = await reload(sub.id)
    expect(after.status).toBe('overdue')
    expect(after.invoices[0].status).toBe('overdue')
    const n = await prisma.notification.count({ where: { clientId: c.id } })
    await svc.processPixAutomaticCycles()
    expect(await prisma.notification.count({ where: { clientId: c.id } })).toBe(n)
  })

  it('pagamento: fatura paga, débito automático vinculado e próximo vencimento igual ao do Asaas', async () => {
    const { sub } = await pixSubscription(2)
    await svc.processPixAutomaticCycles()
    const authId = (await reload(sub.id)).pixAutomaticAuthorizationId!
    const auth = fakeAsaas.payAuthorization(authId)
    await svc.processPixAutomaticCycles()
    const after = await reload(sub.id)
    expect(after.status).toBe('active')
    expect(after.asaasSubscriptionId).toBe(auth.subscriptionId)
    expect(after.invoices[0].status).toBe('paid')
    expect(ymd(after.nextDueDate!)).toBe(auth.startDate)
  })

  it('pagamento atrasado (Pix regerado): próximo vencimento acompanha o débito do Asaas', async () => {
    const { client: c, sub } = await pixSubscription(2)
    await svc.processPixAutomaticCycles()
    await prisma.invoice.updateMany({ where: { subscriptionId: sub.id }, data: { dueDate: days(-15) } })
    await prisma.subscription.update({ where: { id: sub.id }, data: { nextDueDate: days(-15) } })
    // O QR expirou; o cliente abre o link e o sistema gera outro
    fakeAsaas.authorizations.get((await reload(sub.id)).pixAutomaticAuthorizationId!)!.status = 'EXPIRED'
    await svc.getMonthlyPix(c.id)
    const newAuthId = (await reload(sub.id)).pixAutomaticAuthorizationId!
    const auth = fakeAsaas.payAuthorization(newAuthId)
    await svc.getMonthlyPix(c.id)
    const after = await reload(sub.id)
    expect(after.invoices[0].status).toBe('paid')
    expect(ymd(after.nextDueDate!)).toBe(auth.startDate)
  })

  it('evento de ativação forjado (autorização não paga) não ativa nada', async () => {
    const { sub } = await pixSubscription(2)
    await svc.processPixAutomaticCycles()
    const authId = (await reload(sub.id)).pixAutomaticAuthorizationId!
    await svc.handlePixAutomaticAuthorizationEvent('PIX_AUTOMATIC_RECURRING_AUTHORIZATION_ACTIVATED', authId)
    const after = await reload(sub.id)
    expect(after.invoices[0].status).toBe('pending')
    expect(after.asaasSubscriptionId).toBeNull()
  })
})

describe('migração das assinaturas antigas', () => {
  async function legacy(payments: { status: string; due: Date; value?: number }[]) {
    const p = await plan()
    const c = await client()
    const asaasSub = fakeAsaas.addSubscription({ customer: 'cus_old', value: 19, nextDueDate: ymd(days(40)) })
    for (const pay of payments) fakeAsaas.addPayment({ customer: 'cus_old', subscription: asaasSub.id, status: pay.status, value: pay.value ?? 19, dueDate: ymd(pay.due) })
    const sub = await prisma.subscription.create({ data: { clientId: c.id, planId: p.id, status: 'active', asaasSubscriptionId: asaasSub.id, nextDueDate: days(10) } })
    return { sub, asaasSub }
  }

  it('não migra quem tem cobrança vencida no Asaas', async () => {
    const { sub } = await legacy([{ status: 'OVERDUE', due: days(-3) }])
    expect((await svc.migrateToPixAutomatic(sub.id)).migrated).toBe(false)
  })

  it('não migra com o ciclo já pago adiantado, a menos que o admin decida', async () => {
    const { sub } = await legacy([{ status: 'RECEIVED', due: days(20) }])
    expect((await svc.migrateToPixAutomatic(sub.id)).migrated).toBe(false)
    expect((await svc.migrateToPixAutomatic(sub.id, { ignorePaidCycle: true, nextDueDate: days(20) })).migrated).toBe(true)
  })

  it('migra: remove a cobrança pendente e a assinatura antiga, mantém o valor real do Asaas', async () => {
    const pendingDue = days(10)
    const { sub, asaasSub } = await legacy([{ status: 'RECEIVED', due: days(-20) }, { status: 'PENDING', due: pendingDue }])
    const r = await svc.migrateToPixAutomatic(sub.id)
    expect(r.migrated).toBe(true)
    expect([...fakeAsaas.payments.values()].some((x) => x.status === 'PENDING')).toBe(false)
    expect(fakeAsaas.subscriptions.has(asaasSub.id)).toBe(false)
    const after = await reload(sub.id)
    expect(after.asaasSubscriptionId).toBeNull()
    expect(Number(after.customPrice)).toBe(19)
    expect(ymd(after.nextDueDate!)).toBe(ymd(pendingDue))
  })

  it('cron só migra com a chave ligada', async () => {
    const { sub } = await legacy([{ status: 'PENDING', due: days(10) }])
    await svc.processPixAutomaticCycles()
    expect((await reload(sub.id)).asaasSubscriptionId).not.toBeNull()
    await svc.setPixMigrationEnabled(true)
    await svc.processPixAutomaticCycles()
    expect((await reload(sub.id)).asaasSubscriptionId).toBeNull()
  })
})

describe('plano mensal sem taxa', () => {
  it('assinar → pagar o 1º Pix → assinatura ativa, fatura paga e projeto no briefing (sem duplicar)', async () => {
    await plan()
    const c = await client({ entryFlow: 'mensal', monthlyPrice: 49 })
    expect((await svc.acceptMonthlyContract(c.id, { ipAddress: '1.2.3.4', userAgent: 'teste' })).error).toBeUndefined()
    const pending = await prisma.subscription.findFirstOrThrow({ where: { clientId: c.id } })
    expect(pending.status).toBe('pending')
    expect(await prisma.contractAcceptance.count({ where: { clientId: c.id } })).toBe(1)

    fakeAsaas.payAuthorization(pending.pixAutomaticAuthorizationId!)
    await svc.getMonthlyPix(c.id)
    await svc.handlePixAutomaticAuthorizationEvent('PIX_AUTOMATIC_RECURRING_AUTHORIZATION_ACTIVATED', pending.pixAutomaticAuthorizationId!)

    const after = await reload(pending.id)
    expect(after.status).toBe('active')
    expect(after.fidelityEndsAt).toBeNull()
    expect(after.invoices.filter((i) => i.status === 'paid')).toHaveLength(1)
    expect(await prisma.proposal.count({ where: { clientId: c.id, status: 'aguardando_info' } })).toBe(1)
  })

  it('não aceita assinar sem CPF/CNPJ válido', async () => {
    const c = await client({ entryFlow: 'mensal', monthlyPrice: 49, document: '123' })
    expect((await svc.acceptMonthlyContract(c.id, { ipAddress: null, userAgent: null })).error).toBeTruthy()
  })
})

describe('baixa manual pelo admin', () => {
  it('mensalidade por Pix paga por fora: fecha o Pix em aberto', async () => {
    const { client: c, sub } = await pixSubscription(2)
    await svc.processPixAutomaticCycles()
    await confirmManualPayment(c.id, sub.id)
    const after = await reload(sub.id)
    expect(after.invoices[0].status).toBe('paid')
    expect(after.pixAutomaticAuthorizationId).toBeNull()
  })

  it('dá baixa na cobrança vencida MAIS ANTIGA primeiro', async () => {
    const p = await plan()
    const c = await client()
    const asaasSub = fakeAsaas.addSubscription({ customer: 'cus_m', value: 29, nextDueDate: ymd(days(30)) })
    const sub = await prisma.subscription.create({ data: { clientId: c.id, planId: p.id, status: 'overdue', asaasSubscriptionId: asaasSub.id, nextDueDate: days(-40) } })
    const old = fakeAsaas.addPayment({ customer: 'cus_m', subscription: asaasSub.id, status: 'OVERDUE', value: 29, dueDate: ymd(days(-40)) })
    const recent = fakeAsaas.addPayment({ customer: 'cus_m', subscription: asaasSub.id, status: 'OVERDUE', value: 29, dueDate: ymd(days(-10)) })
    await prisma.invoice.create({ data: { subscriptionId: sub.id, amount: 29, status: 'overdue', dueDate: days(-40), asaasChargeId: old.id } })
    await prisma.invoice.create({ data: { subscriptionId: sub.id, amount: 29, status: 'overdue', dueDate: days(-10), asaasChargeId: recent.id } })
    await confirmManualPayment(c.id, sub.id)
    expect(fakeAsaas.payments.get(old.id)!.status).toBe('RECEIVED_IN_CASH')
    expect(fakeAsaas.payments.get(recent.id)!.status).toBe('OVERDUE')
  })

  it('se o Asaas recusar a baixa, nada é alterado e o erro aparece', async () => {
    const p = await plan()
    const c = await client()
    const sub = await prisma.subscription.create({ data: { clientId: c.id, planId: p.id, status: 'overdue', asaasSubscriptionId: 'sub_inexistente', nextDueDate: days(-5) } })
    await prisma.invoice.create({ data: { subscriptionId: sub.id, amount: 29, status: 'overdue', dueDate: days(-5), asaasChargeId: 'pay_inexistente' } })
    const r = await confirmManualPayment(c.id, sub.id)
    expect(r.error).toBeTruthy()
    expect((await reload(sub.id)).invoices[0].status).toBe('overdue')
  })
})
