import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import type { Prisma, ProspectStatus } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { Badge, buttonVariantClass, EmptyState } from '@/components/ui'
import { getProspectingConfig } from '@/lib/prospecting/config'
import { PROSPECT_STATUS, fmtDateTimeSP, type ProspectStatusKey } from '@/lib/prospecting/labels'
import { RunQueueButton } from './_components/RunQueueButton'

export const dynamic = 'force-dynamic'

const FILTERS: ('todos' | ProspectStatusKey)[] = ['todos', 'rascunho', 'ativo', 'pausado', 'interessado', 'respondeu', 'descadastrado', 'invalido', 'finalizado']

export default async function ProspeccaoPage({ searchParams }: { searchParams: { status?: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const filter = FILTERS.includes(searchParams.status as ProspectStatusKey) ? (searchParams.status as ProspectStatusKey) : 'todos'
  const where: Prisma.ProspectWhereInput = filter === 'todos' ? {} : { status: filter as ProspectStatus }

  const [config, counts, prospects] = await Promise.all([
    getProspectingConfig(),
    prisma.prospect.groupBy({ by: ['status'], _count: true }),
    prisma.prospect.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { emails: { select: { status: true, scheduledAt: true, openedAt: true, clickedAt: true } } },
    }),
  ])
  const countOf = (key: string) => (key === 'todos' ? counts.reduce((sum, c) => sum + c._count, 0) : counts.find((c) => c.status === key)?._count ?? 0)

  const rows = prospects.map((p) => {
    const next = p.status === 'ativo'
      ? p.emails.filter((e) => e.status === 'agendado' && e.scheduledAt).sort((a, b) => a.scheduledAt!.getTime() - b.scheduledAt!.getTime())[0]?.scheduledAt
      : null
    return {
      ...p,
      next,
      sent: p.emails.filter((e) => e.status === 'enviado').length,
      opened: p.emails.filter((e) => e.openedAt).length,
      clicked: p.emails.filter((e) => e.clickedAt).length,
    }
  })

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Prospecção</h2>
          <p className="mt-1 text-sm text-gray-500">Sequências de 5 e-mails, dia sim, dia não, em dias úteis</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/prospeccao/configuracoes" className={buttonVariantClass('secondary', 'md')}>Configurações</Link>
          <Link href="/admin/prospeccao/novo" className={buttonVariantClass('primary', 'md')}>Novo prospect</Link>
        </div>
      </div>

      {config.liveMode ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <span>Envios reais ligados · {config.dailyLimit}/dia · {config.windowStart}–{config.windowEnd} em dias úteis. A fila roda sozinha às 9h.</span>
          <RunQueueButton />
        </div>
      ) : (
        <div className="mb-5 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <strong>Modo teste:</strong> nenhum e-mail é enviado a prospects. Use “Enviar teste para mim” no detalhe de um prospect e, depois de validar, ligue os envios reais em{' '}
          <Link href="/admin/prospeccao/configuracoes" className="font-medium underline">Configurações</Link>.
        </div>
      )}

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-gray-200">
        {FILTERS.map((key) => (
          <Link
            key={key}
            href={key === 'todos' ? '/admin/prospeccao' : '/admin/prospeccao?status=' + key}
            className={cn(
              '-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors',
              filter === key ? 'border-brand font-medium text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-800',
            )}
          >
            {key === 'todos' ? 'Todos' : PROSPECT_STATUS[key].label} <span className="text-gray-400">({countOf(key)})</span>
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Nenhum prospect aqui" description="Cadastre um prospect colando o bloco com os 5 e-mails." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="hidden bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500 md:table-header-group">
              <tr>
                <th className="px-4 py-3 font-medium">Prospect</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Próximo envio</th>
                <th className="px-4 py-3 text-right font-medium">Enviados</th>
                <th className="px-4 py-3 text-right font-medium">Abertos</th>
                <th className="px-4 py-3 text-right font-medium">Cliques</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((p) => (
                <tr key={p.id} className="block px-4 py-3 hover:bg-gray-50 md:table-row md:p-0">
                  <td className="block md:table-cell md:px-4 md:py-3">
                    <Link href={'/admin/prospeccao/' + p.id} className="font-medium text-gray-900 hover:underline">{p.business}</Link>
                    <p className="text-xs text-gray-500">{p.name} · {p.email}</p>
                  </td>
                  <td className="mt-2 inline-block md:mt-0 md:table-cell md:px-4 md:py-3">
                    <Badge variant={PROSPECT_STATUS[p.status].variant}>{PROSPECT_STATUS[p.status].label}</Badge>
                  </td>
                  <td className="ml-3 inline-block text-xs text-gray-600 md:ml-0 md:table-cell md:px-4 md:py-3 md:text-sm">
                    <span className="md:hidden">Próximo: </span>{fmtDateTimeSP(p.next)}
                  </td>
                  <td className="mt-1 block text-xs text-gray-500 md:mt-0 md:table-cell md:px-4 md:py-3 md:text-right md:text-sm md:text-gray-700">
                    <span className="md:hidden">Enviados </span>{p.sent}/5
                    <span className="md:hidden"> · Abertos {p.opened} · Cliques {p.clicked}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-right text-gray-700 md:table-cell">{p.opened}</td>
                  <td className="hidden px-4 py-3 text-right text-gray-700 md:table-cell">{p.clicked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
