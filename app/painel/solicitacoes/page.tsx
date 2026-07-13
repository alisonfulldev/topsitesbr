import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SolicitacaoForm } from './_components/SolicitacaoForm'
import { ChangeType } from '@prisma/client'

const ALTERACAO_TYPES: ChangeType[] = ['texto', 'imagem', 'texto_e_imagem']

export default async function SolicitacoesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { clientId: true },
  })
  if (!user?.clientId) redirect('/painel')
  const clientId = user.clientId

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [subscription, sites, monthlyUsed] = await Promise.all([
    prisma.subscription.findFirst({
      where: { clientId, status: { not: 'canceled' } },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.site.findMany({
      where: { clientId },
      select: { id: true, siteUrl: true, siteType: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.ticket.count({
      where: {
        clientId,
        changeType: { in: ALTERACAO_TYPES },
        createdAt: { gte: startOfMonth },
      },
    }),
  ])

  if (!subscription) {
    return (
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-5">Nova Solicitação</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
          Você não possui uma assinatura ativa. Ative um plano para enviar solicitações.
        </div>
      </div>
    )
  }

  const { plan } = subscription

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Nova Solicitação</h2>
        <p className="text-sm text-gray-500 mt-1">
          Plano {plan.name} · Prazo padrão: {plan.changeDeadlineDays} dia
          {plan.changeDeadlineDays !== 1 ? 's' : ''} útil
          {plan.changeDeadlineDays !== 1 ? 'is' : ''}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SolicitacaoForm
          sites={sites.map((s) => ({
            id: s.id,
            siteUrl: s.siteUrl,
            siteType: s.siteType as string,
          }))}
          plan={{
            name: plan.name,
            allowedChangeTypes: plan.allowedChangeTypes,
            monthlyChangesIncluded: plan.monthlyChangesIncluded,
            changeDeadlineDays: plan.changeDeadlineDays,
            discountPercent: plan.discountPercent,
          }}
          monthlyUsed={monthlyUsed}
        />
      </div>
    </div>
  )
}
