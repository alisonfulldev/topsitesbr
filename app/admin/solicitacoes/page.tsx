import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { TicketListClient } from './_components/TicketListClient'

export default async function AdminSolicitacoesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const tickets = await prisma.ticket.findMany({
    include: {
      client: {
        select: {
          name: true,
          subscriptions: {
            where: { status: { not: 'canceled' } },
            select: { plan: { select: { changeDeadlineDays: true } } },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
      site: { select: { siteUrl: true, siteType: true } },
    },
    orderBy: [{ createdAt: 'asc' }],
  })

  const rows = tickets.map((t) => {
    const deadlineDays = t.client.subscriptions[0]?.plan.changeDeadlineDays ?? 7
    const deadlineAt = new Date(t.createdAt)
    deadlineAt.setDate(deadlineAt.getDate() + deadlineDays)

    return {
      id: t.id,
      changeType: t.changeType as string,
      textContent: t.textContent,
      attachmentUrl: t.attachmentUrl,
      status: t.status as string,
      isExtraPaid: t.isExtraPaid,
      isPriority: t.isPriority,
      createdAt: t.createdAt.toISOString(),
      clientName: t.client.name,
      siteUrl: t.site.siteUrl,
      siteType: t.site.siteType as string,
      deadlineAt: deadlineAt.toISOString(),
    }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Fila de Atendimento</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {rows.filter((r) => r.status !== 'done').length} solicitaç
            {rows.filter((r) => r.status !== 'done').length !== 1 ? 'ões' : 'ão'} pendente
            {rows.filter((r) => r.status !== 'done').length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <TicketListClient tickets={rows} />
    </div>
  )
}
