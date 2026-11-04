import { prisma } from '@/lib/prisma'

export async function isClientInProduction(clientId: string): Promise<boolean> {
  const [proposal, subscription] = await Promise.all([
    prisma.proposal.findFirst({
      where: {
        clientId,
        status: { in: ['aguardando_info', 'em_desenvolvimento', 'pronto_revisao'] },
        siteApprovedAt: null,
      },
      select: { id: true },
    }),
    prisma.subscription.findFirst({
      where: { clientId, status: 'active' },
      select: { id: true, customPrice: true },
    }),
  ])
  // Plano mensal: a assinatura fica ativa no 1º Pix, antes do site existir
  return !!proposal && (!subscription || subscription.customPrice != null)
}
