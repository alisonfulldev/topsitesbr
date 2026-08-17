import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { isClientInProduction } from '@/lib/painel-guard'
import { IndicacoesClientPage } from './_components/IndicacoesClientPage'

export default async function PainelIndicacoesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { resolveClientId } = await import('@/lib/impersonation')
  const ctx = await resolveClientId(session)
  if (!ctx) redirect('/painel')
  const clientId = ctx.clientId

  if (await isClientInProduction(clientId)) {
    redirect('/painel/projeto')
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      referralCode: true,
      referralsGiven: {
        include: { referredClient: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!client) redirect('/painel')

  const appUrl = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const referralLink = `${appUrl}/i/${client.referralCode}`

  const referrals = client.referralsGiven.map((r) => ({
    id: r.id,
    referredName: r.referredClient.name,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }))

  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Minhas Indicações</h2>
      <IndicacoesClientPage
        referralCode={client.referralCode}
        referralLink={referralLink}
        referrals={referrals}
      />
    </div>
  )
}
