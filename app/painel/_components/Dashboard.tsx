import Link from 'next/link'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buttonVariantClass } from '@/components/ui/button-class'
import { EmptyState } from '@/components/ui/empty-state'
import {
  AlertTriangleIcon, WrenchIcon, LockIcon, GlobeIcon, ZapIcon,
  BuildingIcon, RocketIcon, BarChartIcon, LightbulbIcon, StarIcon,
} from '@/components/ui/icons'
import type { AnalyticsResult } from '@/lib/integrations/analytics'
import { DesempenhoCard } from './DesempenhoCard'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContextualOffer =
  | { kind: 'upgrade_landing'; upgradeName: string; originalPrice: number; discountedPrice: number | null; planDiscount: number }
  | { kind: 'visits_locked' }
  | { kind: 'plan_pitch' }
  | { kind: 'upsell'; productId: string; name: string; originalPrice: number; discountedPrice: number | null; planDiscount: number }
  | null

type SiteData = {
  id: string
  status: string
  siteType: string
  siteUrl: string | null
  filesZipUrl: string | null
  domain: { domain: string; dnsStatus: string; sslStatus: string } | null
}

type PlanFeatures = {
  monthlyChangesIncluded: number
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `R$ ${n.toFixed(2).replace('.', ',')}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'agora'
  if (m < 60) return `${m}m atrás`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}

// ─── 1. SiteStatusCard ────────────────────────────────────────────────────────
// O card mais importante: justifica a mensalidade. Deve ser tranquilizador
// quando o site está no ar, e urgente quando há problema.

function SiteStatusCard({ site }: { site: SiteData }) {
  const { status, siteUrl, domain } = site

  // ── Suspenso / Offline ──────────────────────────────────────────
  if (status === 'suspenso' || status === 'offline') {
    const isSuspenso = status === 'suspenso'
    return (
      <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangleIcon className="w-6 h-6 mt-0.5 text-red-600 shrink-0" />
          <div>
            <h2 className="font-bold text-red-800 text-base">
              {isSuspenso ? 'Site suspenso' : 'Site offline'}
            </h2>
            <p className="text-sm text-red-700 mt-0.5">
              {isSuspenso
                ? 'Há um pagamento pendente. Regularize para que seu site volte ao ar.'
                : 'Seu site está fora do ar. Entre em contato com o suporte.'}
            </p>
          </div>
        </div>
        {isSuspenso ? (
          <Link href="/painel/assinatura" className={buttonVariantClass('danger', 'md')}>
            Regularizar pagamento
          </Link>
        ) : (
          <Link
            href="/painel/solicitacoes"
            className={buttonVariantClass('secondary', 'md')}
          >
            Falar com suporte
          </Link>
        )}
      </div>
    )
  }

  // ── Manutenção ───────────────────────────────────────────────────
  if (status === 'manutencao') {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <WrenchIcon className="w-6 h-6 mt-0.5 text-blue-600 shrink-0" />
          <div>
            <h2 className="font-bold text-blue-800 text-base">Em manutenção</h2>
            <p className="text-sm text-blue-700 mt-0.5">
              Estamos trabalhando no seu site. Ele voltará ao ar em breve.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Online ───────────────────────────────────────────────────────
  return (
    <Card className="border-green-100 bg-gradient-to-br from-white to-green-50/40">
      {/* Status indicator + URL */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Pulsing green dot */}
          <span className="relative flex h-3 w-3 shrink-0 mt-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-green-600 leading-none mb-1">
              Online
            </p>
            {siteUrl ? (
              <a
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-800 hover:text-brand-text hover:underline break-all leading-snug"
              >
                {siteUrl}
              </a>
            ) : (
              <p className="text-sm text-gray-400 italic">URL será definida em breve</p>
            )}
          </div>
        </div>
        <Badge variant="success" className="shrink-0 mt-0.5">Monitorado 24h</Badge>
      </div>

      {/* Domain + SSL row */}
      {domain ? (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-green-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white rounded-lg px-2.5 py-1.5 border border-gray-100">
            <span className={domain.dnsStatus === 'verificado' ? 'text-green-500' : 'text-gray-400'}>●</span>
            <span>DNS {domain.dnsStatus === 'verificado' ? 'verificado' : domain.dnsStatus}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white rounded-lg px-2.5 py-1.5 border border-gray-100">
            <LockIcon className={`w-3 h-3 ${domain.sslStatus === 'ativo' ? 'text-green-500' : 'text-gray-400'}`} />
            <span>SSL {domain.sslStatus === 'ativo' ? 'ativo' : domain.sslStatus}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white rounded-lg px-2.5 py-1.5 border border-gray-100">
            <GlobeIcon className="w-3 h-3 text-gray-400" />
            <span className="truncate max-w-[120px]">{domain.domain}</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-green-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white rounded-lg px-2.5 py-1.5 border border-gray-100">
            <LockIcon className="w-3 h-3 text-green-500" />
            <span>SSL ativo</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white rounded-lg px-2.5 py-1.5 border border-gray-100">
            <ZapIcon className="w-3 h-3 text-gray-400" />
            <span>Hospedagem ativa</span>
          </div>
        </div>
      )}
    </Card>
  )
}

// ─── 2. ContextualOfferCard ───────────────────────────────────────────────────
// UMA oferta personalizada por vez, com CTA de conversão.
// Nunca exibe mais de um card de oferta no dashboard.

function OfferLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest text-brand-text mb-2">
      {children}
    </p>
  )
}

function ContextualOfferCard({ offer }: { offer: NonNullable<ContextualOffer> }) {
  // (a) Upgrade de site (mini_site → Landing Page, ou mini_site/landing_page → Institucional)
  if (offer.kind === 'upgrade_landing') {
    const hasDiscount = offer.planDiscount > 0 && offer.discountedPrice !== null
    const isInstit = offer.upgradeName.includes('Institucional')
    const headline = isInstit ? 'Evolua para Site Institucional' : 'Evolua para Landing Page'
    const description = isInstit
      ? 'Múltiplas páginas, mais credibilidade e presença profissional completa para o seu negócio.'
      : 'Mais seções, mais conversão e mais profissionalismo que um Mini Site. Criada do zero para o seu negócio.'
    return (
      <Card className="border-brand-200 bg-brand-50/40">
        <OfferLabel>Para você</OfferLabel>
        <div className="flex items-start gap-3 mb-4">
          {isInstit
            ? <BuildingIcon className="w-6 h-6 text-gray-700 shrink-0 mt-0.5" />
            : <RocketIcon className="w-6 h-6 text-brand-text shrink-0 mt-0.5" />
          }
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-snug">{headline}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        <div className="flex items-end gap-2 mb-4">
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">{fmt(offer.originalPrice)}</span>
          )}
          <span className="text-2xl font-bold text-gray-900">
            {fmt(hasDiscount ? offer.discountedPrice! : offer.originalPrice)}
          </span>
          {hasDiscount && (
            <Badge variant="success" className="mb-0.5">
              {offer.planDiscount}% off
            </Badge>
          )}
        </div>
        <Link href="/painel/upgrades" className={buttonVariantClass('conversion', 'md') + ' inline-flex w-full justify-center'}>
          Fazer upgrade →
        </Link>
      </Card>
    )
  }

  // (b) Plano Básico: visitas bloqueadas
  if (offer.kind === 'visits_locked') {
    return (
      <Card className="border-brand-200 bg-brand-50/40">
        <OfferLabel>Seu site pode estar crescendo</OfferLabel>
        <div className="flex items-start gap-3 mb-4">
          <BarChartIcon className="w-6 h-6 text-gray-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-snug">
              Veja quem está visitando seu site — agora bloqueado
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Sem saber quantas visitas chegam, você está gerindo no escuro. No Plus
              você acompanha visitantes, origem do tráfego e páginas mais vistas
              — tudo no painel.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {['Visitas', 'Origem', 'Páginas'].map((label) => (
            <div key={label} className="flex flex-col items-center p-2.5 rounded-xl bg-white border border-gray-100 gap-1">
              <p className="text-lg font-bold text-gray-200 blur-[2px]">—</p>
              <p className="text-[10px] text-gray-300">{label}</p>
            </div>
          ))}
        </div>
        <Link href="/painel/assinatura" className={buttonVariantClass('conversion', 'md') + ' inline-flex w-full justify-center'}>
          Desbloquear dados por R$29/mês →
        </Link>
        <p className="text-center text-[11px] text-gray-400 mt-2">
          + 1 alteração/mês inclusa · 10% de desconto em upgrades
        </p>
      </Card>
    )
  }

  // (c) Pagou alteração avulsa — sugerir upgrade de plano
  if (offer.kind === 'plan_pitch') {
    return (
      <Card className="border-brand-200 bg-brand-50/40">
        <OfferLabel>Economize</OfferLabel>
        <div className="flex items-start gap-3 mb-4">
          <LightbulbIcon className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-snug">
              No Plus essa alteração estaria inclusa
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Você pagou por uma alteração avulsa esse mês. No plano Plus (R$29/mês),
              1 alteração já está inclusa — sem custo extra.
            </p>
          </div>
        </div>
        <Link href="/painel/assinatura" className={buttonVariantClass('conversion', 'md') + ' inline-flex w-full justify-center'}>
          Fazer upgrade para Plus →
        </Link>
      </Card>
    )
  }

  // (d) Próximo upsell
  if (offer.kind === 'upsell') {
    const hasDiscount = offer.planDiscount > 0 && offer.discountedPrice !== null
    return (
      <Card className="border-brand-200 bg-brand-50/40">
        <OfferLabel>Disponível para você</OfferLabel>
        <div className="flex items-start gap-3 mb-4">
          <StarIcon className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-snug">{offer.name}</h3>
            <p className="text-sm text-gray-600 mt-1">Adicione ao seu site com um clique.</p>
          </div>
        </div>
        <div className="flex items-end gap-2 mb-4">
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">{fmt(offer.originalPrice)}</span>
          )}
          <span className="text-2xl font-bold text-gray-900">
            {fmt(hasDiscount ? offer.discountedPrice! : offer.originalPrice)}
          </span>
          {hasDiscount && (
            <Badge variant="success" className="mb-0.5">{offer.planDiscount}% off</Badge>
          )}
        </div>
        <Link href="/painel/upgrades" className={buttonVariantClass('conversion', 'md') + ' inline-flex w-full justify-center'}>
          Adicionar ao meu site →
        </Link>
      </Card>
    )
  }

  return null
}

// ─── 3. InfoCards ─────────────────────────────────────────────────────────────

const LOW_VISITS_THRESHOLD = 150

function VisitsInfoCard({
  plan,
  analytics,
}: {
  plan: PlanFeatures
  analytics: AnalyticsResult | null
}) {
  const isPlus = plan.monthlyChangesIncluded >= 1
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

  if (!isPlus) {
    return (
      <Card className="flex flex-col justify-between">
        <CardTitle>Visitas do Site</CardTitle>
        <div className="flex-1 flex flex-col justify-center py-3">
          <p className="text-3xl font-bold text-gray-200">—</p>
          <p className="text-xs text-gray-400 mt-1">disponível no Plus</p>
        </div>
      </Card>
    )
  }

  if (!analytics || !analytics.ok) {
    return (
      <Card className="flex flex-col justify-between">
        <CardTitle>Visitas do Site</CardTitle>
        <div className="flex-1 flex flex-col justify-center py-3">
          <p className="text-sm text-gray-400 italic">
            {analytics?.message ?? 'Coletando dados…'}
          </p>
        </div>
      </Card>
    )
  }

  const { data } = analytics
  const isLowTraffic = data.visits < LOW_VISITS_THRESHOLD

  return (
    <Card className="flex flex-col justify-between">
      <CardTitle>Visitas do Site</CardTitle>
      <div className="flex-1 py-3 space-y-3">
        <div>
          <p className="text-3xl font-bold text-gray-900">{data.visits.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {data.pageViews.toLocaleString('pt-BR')} page views · {data.period}
          </p>
        </div>

        {data.topPages.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Páginas mais vistas</p>
            <ul className="space-y-0.5">
              {data.topPages.slice(0, 3).map((p) => (
                <li key={p.path} className="flex justify-between text-xs text-gray-600 gap-2">
                  <span className="truncate">{p.path || '/'}</span>
                  <span className="shrink-0 text-gray-400">{p.count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.topReferrers.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Origens</p>
            <ul className="space-y-0.5">
              {data.topReferrers.slice(0, 3).map((r) => (
                <li key={r.host} className="flex justify-between text-xs text-gray-600 gap-2">
                  <span className="truncate">{r.host || 'Direto'}</span>
                  <span className="shrink-0 text-gray-400">{r.count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Traffic upsell CTA — aparece para assinantes Plus com pouco tráfego */}
      {isLowTraffic && whatsappNumber && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2 leading-snug">
            Quer mais visitas e clientes chegando pelo Google e redes sociais?
          </p>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Olá! Quero saber mais sobre tráfego pago para o meu site.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-green-500 text-white text-xs font-medium hover:bg-green-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Quero mais visitas →
          </a>
        </div>
      )}
    </Card>
  )
}

function ChangesInfoCard({ plan, used }: { plan: PlanFeatures; used: number }) {
  if (plan.monthlyChangesIncluded === 0) {
    return (
      <Card className="flex flex-col justify-between">
        <CardTitle>Alterações</CardTitle>
        <div className="flex-1 flex flex-col justify-center py-3">
          <p className="text-sm text-gray-500">
            Plano Básico — cada alteração é cobrada à parte.
          </p>
          <Link href="/painel/solicitacoes" className="mt-2 text-xs text-brand-text hover:underline">
            Solicitar alteração →
          </Link>
        </div>
      </Card>
    )
  }

  const remaining = Math.max(0, plan.monthlyChangesIncluded - used)
  const pct = Math.min(100, (used / plan.monthlyChangesIncluded) * 100)
  const isOver = pct >= 100

  return (
    <Card className="flex flex-col justify-between">
      <CardTitle>Alterações do Mês</CardTitle>
      <div className="flex-1 py-3">
        <div className="flex items-baseline gap-1 mb-3">
          <span className={`text-3xl font-bold ${isOver ? 'text-red-500' : 'text-gray-900'}`}>
            {used}
          </span>
          <span className="text-gray-400 text-sm">/ {plan.monthlyChangesIncluded}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${isOver ? 'bg-red-500' : 'bg-brand'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {remaining > 0 ? `${remaining} restante${remaining !== 1 ? 's' : ''}` : 'Limite atingido'}
        </p>
      </div>
    </Card>
  )
}

function BillingInfoCard({ subscription }: { subscription: SubscriptionData }) {
  const isOverdue = subscription.status === 'overdue'
  return (
    <Card className={isOverdue ? 'border-red-200 bg-red-50/30' : ''}>
      <CardTitle>Próxima Cobrança</CardTitle>
      <div className="py-3">
        <p className={`text-2xl font-bold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
          {fmt(subscription.planPrice)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {subscription.nextDueDate
            ? `Vence em ${fmtDate(subscription.nextDueDate)}`
            : 'Data não definida'}
        </p>
        {isOverdue && (
          <Link
            href="/painel/assinatura"
            className="mt-2 inline-block text-xs text-red-600 font-medium hover:underline"
          >
            Regularizar →
          </Link>
        )}
      </div>
    </Card>
  )
}

// ─── 4. PlanBenefitsCard ──────────────────────────────────────────────────────

function PlanBenefitsCard({ subscription }: { subscription: SubscriptionData }) {
  const { plan } = subscription
  const hasWhatsApp = subscription.planPrice >= 29
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

  const benefits = [
    'Hospedagem, SSL e monitoramento 24h',
    `Prazo de atendimento: até ${plan.changeDeadlineDays} dias úteis`,
    ...(plan.monthlyChangesIncluded > 0
      ? [`${plan.monthlyChangesIncluded} alteração${plan.monthlyChangesIncluded > 1 ? 'ões' : ''}/mês inclusa${plan.monthlyChangesIncluded > 1 ? 's' : ''}`]
      : []),
    ...(plan.discountPercent > 0
      ? [`${plan.discountPercent}% de desconto em serviços e upgrades`]
      : []),
    'Correções ilimitadas e gratuitas (links, telefone, textos)',
  ]

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <CardTitle>Seu Plano</CardTitle>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-bold text-gray-900">{subscription.planName}</span>
            <span className="text-sm text-gray-500">{fmt(subscription.planPrice)}/mês</span>
          </div>
        </div>
        <Link
          href="/painel/assinatura"
          className="text-xs text-brand-text hover:underline whitespace-nowrap mt-1"
        >
          Gerenciar →
        </Link>
      </div>

      <ul className="space-y-2 mb-4">
        {benefits.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="text-green-500 shrink-0 mt-0.5">✓</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {hasWhatsApp && whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors min-h-[44px]"
        >
          {/* WhatsApp icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Suporte via WhatsApp
        </a>
      )}
    </Card>
  )
}

// ─── 5. EventsCard ────────────────────────────────────────────────────────────

function EventsCard({ events }: { events: EventData[] }) {
  return (
    <Card padding="none">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <CardTitle className="mb-0">Últimas atualizações</CardTitle>
        <Link
          href="/painel/notificacoes"
          className="text-xs text-brand-text hover:underline"
        >
          Ver todas →
        </Link>
      </div>
      {events.length === 0 ? (
        <EmptyState title="Nenhum evento recente." className="py-8" />
      ) : (
        <ul className="divide-y divide-gray-50">
          {events.map((e) => (
            <li key={e.id} className="flex items-start gap-3 px-5 py-3">
              <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${e.read ? 'bg-gray-200' : 'bg-brand'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{e.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{e.message}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0 mt-0.5">{timeAgo(e.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

// ─── Dashboard Root ───────────────────────────────────────────────────────────

export function Dashboard({
  sites,
  subscription,
  ticketsUsedThisMonth,
  recentEvents,
  contextualOffer,
  analytics,
}: {
  sites: SiteData[]
  subscription: SubscriptionData | null
  ticketsUsedThisMonth: number
  recentEvents: EventData[]
  contextualOffer: ContextualOffer
  analytics: AnalyticsResult | null
}) {
  const primarySite = sites[0] ?? null

  // Sem assinatura: estado simplificado com acesso ao download
  if (!subscription) {
    return (
      <div className="max-w-lg">
        <Card>
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm mb-3">Você ainda não possui uma assinatura ativa.</p>
            {primarySite?.filesZipUrl && (
              <a href={primarySite.filesZipUrl} download className="text-sm text-brand-text hover:underline">
                ↓ Baixar arquivos do site
              </a>
            )}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl lg:max-w-4xl space-y-4">
      {/* 1. Status do site */}
      {primarySite && <SiteStatusCard site={primarySite} />}

      {/* 2. Oferta contextual — nunca mais de uma */}
      {contextualOffer && <ContextualOfferCard offer={contextualOffer} />}

      {/* 3. Cards informativos em grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <VisitsInfoCard plan={subscription.plan} analytics={analytics} />
        <ChangesInfoCard plan={subscription.plan} used={ticketsUsedThisMonth} />
        <BillingInfoCard subscription={subscription} />
      </div>

      {/* 4. Desempenho do site — só exibe quando o site está online e tem URL */}
      {primarySite?.status === 'online' && primarySite.siteUrl && (
        <DesempenhoCard siteUrl={primarySite.siteUrl} />
      )}

      {/* 5. Benefícios do plano */}
      <PlanBenefitsCard subscription={subscription} />

      {/* 6. Histórico compacto */}
      <EventsCard events={recentEvents} />

      {/* 7. Download discreto — só se houver arquivo */}
      {primarySite?.filesZipUrl && (
        <div className="text-center py-2">
          <a
            href={primarySite.filesZipUrl}
            download
            className="text-xs text-gray-400 hover:text-gray-600 hover:underline transition-colors"
          >
            ↓ Baixar arquivos do site (ZIP)
          </a>
        </div>
      )}
    </div>
  )
}
