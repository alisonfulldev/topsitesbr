import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fakeAsaas, fakeAsaasModule } from '../helpers/fake-asaas'
import { plan } from '../helpers/factories'

vi.mock('@/lib/integrations/asaas', () => fakeAsaasModule())

const svc = await import('@/lib/online-proposal/service')
const { POST } = await import('@/app/api/webhooks/asaas/route')

beforeEach(() => fakeAsaas.reset())

async function newProposal() {
  await plan()
  return prisma.onlineProposal.create({
    data: {
      token: svc.newToken(), name: 'Maria Souza', company: 'Padaria da Maria', email: 'maria@teste.local', whatsapp: '11987654321',
      planKey: 'sem_painel', planName: 'Sem painel', setupPrice: 197, monthlyPrice: 49,
      extras: [{ key: 'botao_atendimento', name: 'Botão de atendimento', price: 300 }],
      previewUrl: 'https://exemplo.github.io/site', expiresAt: new Date(Date.now() + 15 * 86_400_000),
    },
  })
}

describe('proposta online: prévia → aprovação → contrato → pagamento', () => {
  it('fluxo completo cria cliente, assinatura por Pix em 30 dias e projeto no briefing — uma única vez', async () => {
    const p = await newProposal()
    expect((await svc.sendPreview(p.id)).error).toBeUndefined()
    expect(await prisma.onlineProposalEmail.count({ where: { proposalId: p.id } })).toBe(5)

    await svc.setExtras(p.token, ['botao_atendimento'])
    expect((await svc.approveProposal(p.token)).error).toBeUndefined()
    // a sequência de e-mails para na aprovação
    expect(await prisma.onlineProposalEmail.count({ where: { proposalId: p.id, status: 'agendado' } })).toBe(0)

    expect((await svc.signContract(p.token, { accepted: true, fullName: 'Maria Souza', cpf: '529.982.247-25' }, { ip: '1.2.3.4', userAgent: 'teste' })).error).toBeUndefined()
    const signed = await prisma.onlineProposal.findUniqueOrThrow({ where: { id: p.id } })
    expect(signed.contractHash).toHaveLength(64)

    const { paymentUrl } = await svc.startSetupPayment(p.token, 'PIX')
    expect(paymentUrl).toBeTruthy()
    const charge = fakeAsaas.payments.get(signed.setupChargeId ?? (await prisma.onlineProposal.findUniqueOrThrow({ where: { id: p.id } })).setupChargeId!)!
    expect(charge.value).toBe(497) // setup 197 + extra 300
    charge.status = 'RECEIVED'

    const hook = () => POST(new NextRequest('https://topsitebr.com.br/api/webhooks/asaas', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event: 'PAYMENT_RECEIVED', payment: { id: charge.id, externalReference: `online-proposal:${p.id}` } }),
    }))
    await hook()
    await hook() // webhook repetido

    const done = await prisma.onlineProposal.findUniqueOrThrow({ where: { id: p.id } })
    expect(done.status).toBe('ativo')
    expect(await prisma.client.count({ where: { email: 'maria@teste.local' } })).toBe(1)
    const sub = await prisma.subscription.findFirstOrThrow({ where: { clientId: done.clientId! } })
    expect(Number(sub.customPrice)).toBe(49)
    expect(sub.asaasSubscriptionId).toBeNull()
    expect(Math.round((sub.nextDueDate!.getTime() - Date.now()) / 86_400_000)).toBe(30)
    expect(await prisma.proposal.count({ where: { clientId: done.clientId!, status: 'aguardando_info' } })).toBe(1)
    expect(await prisma.order.count({ where: { clientId: done.clientId!, status: 'paid' } })).toBe(1)
  })

  it('pagamento forjado (cobrança não paga no Asaas) não ativa a proposta', async () => {
    const p = await newProposal()
    await svc.sendPreview(p.id)
    await svc.approveProposal(p.token)
    await svc.signContract(p.token, { accepted: true, fullName: 'Maria Souza', cpf: '52998224725' }, { ip: null, userAgent: null })
    await svc.startSetupPayment(p.token, 'PIX')
    const { setupChargeId } = await prisma.onlineProposal.findUniqueOrThrow({ where: { id: p.id } })
    await POST(new NextRequest('https://topsitebr.com.br/api/webhooks/asaas', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event: 'PAYMENT_RECEIVED', payment: { id: setupChargeId, externalReference: `online-proposal:${p.id}` } }),
    }))
    expect((await prisma.onlineProposal.findUniqueOrThrow({ where: { id: p.id } })).status).toBe('contrato_assinado')
  })

  it('não assina com CPF inválido', async () => {
    const p = await newProposal()
    await svc.sendPreview(p.id)
    await svc.approveProposal(p.token)
    expect((await svc.signContract(p.token, { accepted: true, fullName: 'Maria Souza', cpf: '111.111.111-11' }, { ip: null, userAgent: null })).error).toBeTruthy()
  })
})
