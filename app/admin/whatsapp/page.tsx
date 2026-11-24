import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import type { Prisma, WaCategory } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { Badge, buttonVariantClass, Card, EmptyState } from '@/components/ui'
import { getWaConfig } from '@/lib/whatsapp/config'
import { whatsappConfigured } from '@/lib/whatsapp/cloud-api'
import { aiConfigured } from '@/lib/whatsapp/ai'
import { proactiveSentToday } from '@/lib/whatsapp/engine'
import { spDayBounds } from '@/lib/prospecting/schedule'
import { WA_CATEGORY, fmtDateTimeSP, type WaCategoryKey } from '@/lib/whatsapp/labels'
import { RunNowButton } from './_components/RunNowButton'
import { BulkCategorize } from './_components/BulkCategorize'

export const dynamic = 'force-dynamic'

const FILTERS: ('todos' | WaCategoryKey)[] = ['todos', 'lead', 'cliente', 'revisar', 'pessoal', 'nao_classificado']

export default async function WhatsappPage({ searchParams }: { searchParams: { cat?: string; q?: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const filter = FILTERS.includes(searchParams.cat as WaCategoryKey) ? (searchParams.cat as WaCategoryKey) : 'todos'
  const q = (searchParams.q ?? '').trim()
  const where: Prisma.WaContactWhereInput = {
    ...(filter === 'todos' ? {} : { category: filter as WaCategory }),
    ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { waId: { contains: q.replace(/\D/g, '') || q } }] } : {}),
  }
  const now = new Date()
  const { start } = spDayBounds(now)

  const [config, counts, contacts, awaiting, aiToday, proactiveToday] = await Promise.all([
    getWaConfig(),
    prisma.waContact.groupBy({ by: ['category'], _count: true }),
    prisma.waContact.findMany({
      where,
      orderBy: [{ lastMessageAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
      take: 200,
    }),
    prisma.waContact.count({ where: { awaitingReply: true, category: { not: 'pessoal' }, optedOutAt: null } }),
    prisma.waMessage.count({ where: { author: 'ia', sentAt: { gte: start } } }),
    proactiveSentToday(now),
  ])
  const countOf = (key: string) => (key === 'todos' ? counts.reduce((s, c) => s + c._count, 0) : counts.find((c) => c.category === key)?._count ?? 0)
  const missing = [!whatsappConfigured() && 'WhatsApp (WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID)', !aiConfigured() && 'IA (ANTHROPIC_API_KEY)'].filter(Boolean)

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">WhatsApp com IA</h2>
          <p className="mt-1 text-sm text-gray-500">A IA responde, faz follow-up dos leads e envia as campanhas. Contatos pessoais ficam de fora.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/whatsapp/campanhas" className={buttonVariantClass('secondary', 'md')}>Campanhas</Link>
          <Link href="/admin/whatsapp/configuracoes" className={buttonVariantClass('secondary', 'md')}>Configurações</Link>
        </div>
      </div>

      {missing.length > 0 && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Falta configurar no servidor: {missing.join(' e ')}.
        </div>
      )}

      {config.liveMode ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <span>Envios reais ligados · follow-ups e ofertas {config.windowStart}–{config.windowEnd} em dias úteis · {proactiveToday}/{config.dailyLimit} hoje.</span>
          <RunNowButton />
        </div>
      ) : (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <span>
            <strong>Modo simulação:</strong> a IA classifica e escreve, mas nada é enviado (aparece como “simulada” na conversa)
            {config.testNumber ? <>, exceto para o número de teste {config.testNumber}</> : null}. Ligue os envios em{' '}
            <Link href="/admin/whatsapp/configuracoes" className="font-medium underline">Configurações</Link>.
          </span>
          <RunNowButton />
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card padding="sm"><p className="text-xs text-gray-500">Leads</p><p className="text-xl font-semibold text-gray-900">{countOf('lead')}</p></Card>
        <Card padding="sm"><p className="text-xs text-gray-500">Aguardando resposta</p><p className="text-xl font-semibold text-gray-900">{awaiting}</p></Card>
        <Card padding="sm"><p className="text-xs text-gray-500">Mensagens da IA hoje</p><p className="text-xl font-semibold text-gray-900">{aiToday}</p></Card>
        <Card padding="sm"><p className="text-xs text-gray-500">A revisar</p><p className="text-xl font-semibold text-gray-900">{countOf('revisar')}</p></Card>
      </div>

      <form className="mb-3" action="/admin/whatsapp">
        {filter !== 'todos' && <input type="hidden" name="cat" value={filter} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome ou número"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none sm:max-w-xs"
        />
      </form>

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-gray-200">
        {FILTERS.map((key) => (
          <Link
            key={key}
            href={key === 'todos' ? '/admin/whatsapp' : '/admin/whatsapp?cat=' + key}
            className={cn(
              '-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors',
              filter === key ? 'border-brand font-medium text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-800',
            )}
          >
            {key === 'todos' ? 'Todos' : WA_CATEGORY[key].label} <span className="text-gray-400">({countOf(key)})</span>
          </Link>
        ))}
      </div>

      {filter === 'nao_classificado' && contacts.length > 0 && (
        <BulkCategorize ids={contacts.map((c) => c.id)} />
      )}

      {contacts.length === 0 ? (
        <EmptyState
          title="Nenhum contato aqui"
          description="Os contatos aparecem quando alguém manda mensagem ou depois da sincronização da agenda e do histórico (em Configurações)."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <ul className="divide-y divide-gray-100">
            {contacts.map((c) => {
              const human = c.humanUntil && c.humanUntil > now
              return (
                <li key={c.id}>
                  <Link href={'/admin/whatsapp/' + c.id} className="block px-4 py-3 hover:bg-gray-50">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-medium text-gray-900">{c.name ?? c.waId}</span>
                        {c.name && <span className="ml-2 text-xs text-gray-500">{c.waId}</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {c.awaitingReply && c.category !== 'pessoal' && !c.optedOutAt && <Badge variant="orange">Aguardando resposta</Badge>}
                        {human && <Badge variant="pink">Você atendendo</Badge>}
                        {c.aiPaused && <Badge variant="warning">IA pausada</Badge>}
                        {c.optedOutAt && <Badge variant="error">Descadastrado</Badge>}
                        <Badge variant={WA_CATEGORY[c.category].variant}>{WA_CATEGORY[c.category].label}{c.categoryByAdmin ? ' · manual' : ''}</Badge>
                      </div>
                    </div>
                    <div className="mt-1 flex flex-wrap justify-between gap-2 text-xs text-gray-500">
                      <span className="line-clamp-1 max-w-2xl">{c.summary ?? (c.needsAnalysis ? 'Aguardando análise da IA…' : '—')}</span>
                      <span className="whitespace-nowrap">{fmtDateTimeSP(c.lastMessageAt)}</span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
      {contacts.length === 200 && <p className="mt-2 text-xs text-gray-500">Mostrando os 200 mais recentes. Use a busca para achar outros.</p>}
    </div>
  )
}
