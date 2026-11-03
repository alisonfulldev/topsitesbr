'use server'

import { getServerSession } from 'next-auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { acceptMonthlyContract, activateMonthlySubscription, getMonthlyPix, type MonthlyPix } from '@/lib/monthly-plan-service'

async function getClientId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') return null
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { clientId: true },
  })
  return user?.clientId ?? null
}

/** Cliente marcou o aceite e assinou o contrato no modal. */
export async function signMonthlyContractAction(accepted: boolean): Promise<{ error?: string }> {
  try {
    const { assertNotImpersonating } = await import('@/lib/impersonation')
    try { await assertNotImpersonating() } catch (e) {
      return { error: (e as Error).message }
    }
    if (!accepted) return { error: 'Você precisa ler e aceitar o contrato para continuar.' }

    const clientId = await getClientId()
    if (!clientId) return { error: 'Não autorizado.' }

    const hdrs = headers()
    const rawIp = hdrs.get('x-forwarded-for') ?? hdrs.get('x-real-ip') ?? null
    const result = await acceptMonthlyContract(clientId, {
      ipAddress: rawIp ? rawIp.split(',')[0].trim() : null,
      userAgent: hdrs.get('user-agent'),
    })
    if (result.error) return result

    revalidatePath('/painel')
    return {}
  } catch (err) {
    console.error('[mensal] erro ao assinar contrato', err)
    return { error: 'Não foi possível concluir agora. Tente novamente em instantes.' }
  }
}

/** Consulta o Pix do primeiro mês — usado no polling da tela de pagamento. */
export async function getMonthlyPixAction(): Promise<{ pix?: MonthlyPix | null; error?: string }> {
  try {
    const clientId = await getClientId()
    if (!clientId) return { error: 'Não autorizado.' }
    const pix = await getMonthlyPix(clientId)
    if (pix?.status === 'ACTIVE') revalidatePath('/painel')
    return { pix }
  } catch (err) {
    console.error('[mensal] erro ao consultar Pix', err)
    return { error: 'Não foi possível consultar o pagamento agora.' }
  }
}

/** Só em desenvolvimento (driver mock): simula a confirmação do primeiro Pix. */
export async function simulateMonthlyPaymentAction(): Promise<{ error?: string }> {
  if (process.env.NODE_ENV === 'production' || process.env.PAYMENT_DRIVER === 'asaas') {
    return { error: 'Disponível apenas no ambiente de desenvolvimento.' }
  }
  const clientId = await getClientId()
  if (!clientId) return { error: 'Não autorizado.' }
  const subscription = await prisma.subscription.findFirst({
    where: { clientId, status: 'pending', pixAutomaticAuthorizationId: { not: null } },
  })
  if (!subscription) return { error: 'Nenhum pagamento pendente.' }
  await activateMonthlySubscription(subscription.id, null)
  revalidatePath('/painel')
  return {}
}
