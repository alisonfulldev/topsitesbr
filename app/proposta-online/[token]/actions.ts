'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import {
  activateOnlineProposal,
  approveProposal,
  requestAdjustment,
  setExtras,
  signContract,
  startSetupPayment,
  syncSetupPayment,
} from '@/lib/online-proposal/service'

// Ações do prospect na página da proposta (acesso pelo token, sem login)

type Result = { error?: string; paymentUrl?: string }

async function run(token: string, fn: () => Promise<Result>): Promise<Result> {
  try {
    const result = await fn()
    revalidatePath(`/proposta-online/${token}`)
    return result
  } catch (err) {
    console.error('[proposta-online]', err)
    return { error: 'Não foi possível concluir agora. Tente novamente em instantes.' }
  }
}

export async function setExtrasAction(token: string, keys: string[]) {
  return run(token, () => setExtras(token, keys))
}

export async function approveAction(token: string) {
  return run(token, () => approveProposal(token))
}

export async function requestAdjustmentAction(token: string, text: string) {
  return run(token, () => requestAdjustment(token, text))
}

export async function signContractAction(token: string, input: { accepted: boolean; fullName: string; cpf: string }) {
  const hdrs = headers()
  const rawIp = hdrs.get('x-forwarded-for') ?? hdrs.get('x-real-ip') ?? null
  return run(token, () =>
    signContract(token, input, { ip: rawIp ? rawIp.split(',')[0].trim() : null, userAgent: hdrs.get('user-agent') }),
  )
}

export async function startPaymentAction(token: string, method: 'PIX' | 'CREDIT_CARD') {
  return run(token, () => startSetupPayment(token, method))
}

export async function checkPaymentAction(token: string): Promise<{ paid: boolean }> {
  await syncSetupPayment(token)
  const p = await prisma.onlineProposal.findUnique({ where: { token }, select: { status: true } })
  return { paid: p?.status === 'ativo' }
}

/** Só em desenvolvimento (pagamento simulado): confirma o setup sem passar pelo Asaas. */
export async function simulatePaymentAction(token: string): Promise<Result> {
  if (process.env.NODE_ENV === 'production' || process.env.PAYMENT_DRIVER === 'asaas') {
    return { error: 'Disponível apenas no ambiente de desenvolvimento.' }
  }
  const p = await prisma.onlineProposal.findUnique({ where: { token } })
  if (!p) return { error: 'Proposta não encontrada.' }
  await activateOnlineProposal(p.id, p.setupChargeId)
  revalidatePath(`/proposta-online/${token}`)
  return {}
}
