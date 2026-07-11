import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { IndicacoesAdminClient } from './_components/IndicacoesAdminClient'

export default async function AdminIndicacoesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const referrals = await prisma.referral.findMany({
    include: {
      referrerClient: { select: { id: true, name: true, email: true } },
      referredClient: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const rows = referrals.map((r) => ({
    id: r.id,
    referrerName: r.referrerClient.name,
    referrerEmail: r.referrerClient.email,
    referredName: r.referredClient.name,
    referredEmail: r.referredClient.email,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    rewardedAt: r.rewardedAt?.toISOString() ?? null,
  }))

  const confirmadas = rows.filter((r) => r.status === 'confirmado').length

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Indicações</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {rows.length} indicaç{rows.length !== 1 ? 'ões' : 'ão'} registrada{rows.length !== 1 ? 's' : ''}
          {confirmadas > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
              {confirmadas} aguardando recompensa
            </span>
          )}
        </p>
      </div>
      <IndicacoesAdminClient referrals={rows} />
    </div>
  )
}
