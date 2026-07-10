import Link from 'next/link'

const SITE_STATUS_LABEL: Record<string, string> = {
  pendente_ativacao: 'Aguardando ativação',
  online: 'Online',
  offline: 'Offline',
  manutencao: 'Em manutenção',
  suspenso: 'Suspenso',
}

const SITE_STATUS_COLOR: Record<string, string> = {
  pendente_ativacao: 'bg-yellow-100 text-yellow-700',
  online: 'bg-green-100 text-green-700',
  offline: 'bg-gray-100 text-gray-600',
  manutencao: 'bg-blue-100 text-blue-700',
  suspenso: 'bg-red-100 text-red-700',
}

const DNS_STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  verificado: 'Verificado',
  falhou: 'Falhou',
}

const SSL_STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  ativo: 'Ativo',
  falhou: 'Falhou',
}

const SUB_STATUS_LABEL: Record<string, string> = {
  active: 'Ativa',
  overdue: 'Inadimplente',
  canceled: 'Cancelada',
}

const SUB_STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  canceled: 'bg-gray-100 text-gray-500',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function formatPrice(n: number) {
  return `R$ ${n.toFixed(2).replace('.', ',')}`
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'agora'
  if (m < 60) return `${m}m atrás`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h atrás`
  const d = Math.floor(h / 24)
  return `${d}d atrás`
}

type SiteData = {
  id: string
  status: string
  siteUrl: string | null
  filesZipUrl: string | null
  domain: { domain: string; dnsStatus: string; sslStatus: string } | null
}

type PlanFeatures = {
  monthlyChangesIncluded: number
  prioritySupport: boolean
  allowedChangeTypes: string
  changeDeadlineDays: number
  discountPercent: number
}

type SubscriptionData = {
  planName: string
  planPrice: number
  status: string
  nextDueDate: string | null
  planActivatedAt: string
  plan: PlanFeatures
}

type EventData = {
  id: string
  title: string
  message: string
  createdAt: string
  read: boolean
}

function SiteCard({ site }: { site: SiteData }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
        Meu Site
      </h3>
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
            SITE_STATUS_COLOR[site.status] ?? 'bg-gray-100 text-gray-600'
          }`}
        >
          {SITE_STATUS_LABEL[site.status] ?? site.status}
        </span>
      </div>

      {site.siteUrl ? (
        <a
          href={site.siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-600 hover:underline break-all"
        >
          {site.siteUrl}
        </a>
      ) : (
        <p className="text-sm text-gray-400 italic">URL não definida ainda</p>
      )}

      {site.domain && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-1">
          <p>
            <span className="font-medium text-gray-700">Domínio:</span> {site.domain.domain}
          </p>
          <p>
            <span className="font-medium text-gray-700">DNS:</span>{' '}
            {DNS_STATUS_LABEL[site.domain.dnsStatus] ?? site.domain.dnsStatus}
            {' · '}
            <span className="font-medium text-gray-700">SSL:</span>{' '}
            {SSL_STATUS_LABEL[site.domain.sslStatus] ?? site.domain.sslStatus}
          </p>
        </div>
      )}

      {site.filesZipUrl && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <a
            href={site.filesZipUrl}
            download
            className="text-xs text-gray-500 hover:text-indigo-600 underline transition-colors"
          >
            ↓ Baixar arquivos do site
          </a>
        </div>
      )}
    </div>
  )
}

function deadlineLabel(days: number, priority: boolean): string {
  const label = days === 1 ? '1 dia útil' : `${days} dias úteis`
  return priority ? `${label} (prioritário)` : label
}

function PlanCard({ subscription }: { subscription: SubscriptionData }) {
  const { plan } = subscription
  const hasWhatsApp = subscription.planPrice >= 29
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
        Plano Atual
      </h3>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-xl font-bold text-gray-900">{subscription.planName}</span>
        <span className="text-sm text-gray-500">{formatPrice(subscription.planPrice)}/mês</span>
      </div>
      <span
        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium mb-4 ${
          SUB_STATUS_COLOR[subscription.status] ?? 'bg-gray-100 text-gray-600'
        }`}
      >
        {SUB_STATUS_LABEL[subscription.status] ?? subscription.status}
      </span>

      <ul className="space-y-1.5 text-sm text-gray-600 mb-4">
        <li className="flex gap-2">
          <span className="text-indigo-500 shrink-0">✓</span>
          Hospedagem, SSL e monitoramento
        </li>
        <li className="flex gap-2">
          <span className="text-indigo-500 shrink-0">✓</span>
          Prazo de atendimento: {deadlineLabel(plan.changeDeadlineDays, plan.prioritySupport)}
        </li>
        {plan.monthlyChangesIncluded > 0 && (
          <li className="flex gap-2">
            <span className="text-indigo-500 shrink-0">✓</span>
            {plan.monthlyChangesIncluded} alteração/mês inclusa
          </li>
        )}
        {plan.discountPercent > 0 && (
          <li className="flex gap-2">
            <span className="text-indigo-500 shrink-0">✓</span>
            {plan.discountPercent}% de desconto em serviços avulsos
          </li>
        )}
        {plan.prioritySupport && (
          <li className="flex gap-2">
            <span className="text-indigo-500 shrink-0">✓</span>
            Atendimento prioritário
          </li>
        )}
      </ul>

      <div className="flex flex-col gap-2">
        <Link
          href="/painel/assinatura"
          className="text-center py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Gerenciar assinatura
        </Link>
        {hasWhatsApp && whatsappNumber && (
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
          >
            Suporte via WhatsApp
          </a>
        )}
      </div>
    </div>
  )
}

function ChangesCard({
  plan,
  used,
}: {
  plan: PlanFeatures
  used: number
}) {
  if (plan.monthlyChangesIncluded === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
          Alterações do Mês
        </h3>
        <p className="text-sm text-gray-500">
          O plano Básico não inclui alterações mensais. Cada solicitação é cobrada à parte.
        </p>
        <Link
          href="/painel/assinatura"
          className="mt-3 inline-block text-xs text-indigo-600 hover:underline"
        >
          Fazer upgrade para incluir alterações →
        </Link>
      </div>
    )
  }

  const remaining = Math.max(0, plan.monthlyChangesIncluded - used)
  const pct = Math.min(100, (used / plan.monthlyChangesIncluded) * 100)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
        Alterações do Mês
      </h3>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-3xl font-bold text-gray-900">{used}</span>
        <span className="text-gray-400 text-sm">/ {plan.monthlyChangesIncluded}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
        <div
          className={`h-1.5 rounded-full transition-all ${pct >= 100 ? 'bg-red-500' : 'bg-indigo-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">
        {remaining > 0
          ? `${remaining} alteração${remaining !== 1 ? 'ões' : ''} disponível${remaining !== 1 ? 'is' : ''} este mês`
          : 'Limite atingido — próximas solicitações serão cobradas à parte'}
      </p>
    </div>
  )
}

function VisitsCard({ plan }: { plan: PlanFeatures }) {
  const isPlus = plan.monthlyChangesIncluded >= 1

  if (!isPlus) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 relative overflow-hidden">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
          Visitas do Site
        </h3>
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 rounded-xl">
          <span className="text-lg">🔒</span>
          <p className="text-xs font-medium text-gray-500 text-center px-4">
            Disponível nos planos Plus e Pro
          </p>
          <Link
            href="/painel/assinatura"
            className="text-xs text-indigo-600 hover:underline"
          >
            Fazer upgrade →
          </Link>
        </div>
        <div className="opacity-20 pointer-events-none select-none">
          <p className="text-3xl font-bold text-gray-900">—</p>
          <p className="text-xs text-gray-400 mt-1">visitas este mês</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
        Visitas do Site
      </h3>
      <p className="text-sm text-gray-400 italic">Coletando dados…</p>
      <p className="text-xs text-gray-400 mt-1">Analytics disponível em breve</p>
    </div>
  )
}

function NextBillingCard({ subscription }: { subscription: SubscriptionData }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
        Próxima Cobrança
      </h3>
      <p className="text-2xl font-bold text-gray-900">
        {formatPrice(subscription.planPrice)}
      </p>
      <p className="text-sm text-gray-500 mt-1">
        {subscription.nextDueDate
          ? `Vence em ${formatDate(subscription.nextDueDate)}`
          : 'Data não definida'}
      </p>
    </div>
  )
}

function EventsCard({ events }: { events: EventData[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
        Histórico de Eventos
      </h3>
      {events.length === 0 ? (
        <p className="text-sm text-gray-400">Nenhum evento registrado ainda.</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {events.map((e) => (
            <li key={e.id} className={`py-2.5 flex items-start justify-between gap-4`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{e.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{e.message}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0 mt-0.5">{timeAgo(e.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/painel/notificacoes"
        className="mt-3 inline-block text-xs text-indigo-600 hover:underline"
      >
        Ver todas as notificações →
      </Link>
    </div>
  )
}

export function Dashboard({
  sites,
  subscription,
  ticketsUsedThisMonth,
  recentEvents,
}: {
  sites: SiteData[]
  subscription: SubscriptionData | null
  ticketsUsedThisMonth: number
  recentEvents: EventData[]
}) {
  const primarySite = sites[0] ?? null

  if (!subscription) {
    return (
      <div className="max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-sm mb-3">Você ainda não possui uma assinatura ativa.</p>
          {primarySite?.filesZipUrl && (
            <a
              href={primarySite.filesZipUrl}
              download
              className="text-sm text-indigo-600 hover:underline"
            >
              ↓ Baixar arquivos do site
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {primarySite && <SiteCard site={primarySite} />}
        <PlanCard subscription={subscription} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ChangesCard plan={subscription.plan} used={ticketsUsedThisMonth} />
        <VisitsCard plan={subscription.plan} />
        <NextBillingCard subscription={subscription} />
      </div>

      <EventsCard events={recentEvents} />
    </div>
  )
}
