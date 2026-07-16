import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSiteAnalytics } from '@/lib/integrations/analytics'
import type { AnalyticsResult } from '@/lib/integrations/analytics'
import { syncSubscriptionPayment } from '@/lib/payments/webhook-handlers'
import { ActivationScreen } from './_components/ActivationScreen'
import { Dashboard } from './_components/Dashboard'
import type { ContextualOffer } from './_components/Dashboard'

export default async function PainelPage({
  searchParams,
}: {
  searchParams: { ativado?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { clientId: true },
  })
  if (!user?.clientId) redirect('/login')

  const clientId = user.clientId

  // Confirma o pagamento direto na API do Asaas sempre que a assinatura estiver
  // pendente — resolve webhooks atrasados, localhost e retornos sem ?ativado=1.
  await syncSubscriptionPayment(clientId)

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [client, subscription, ticketsUsedThisMonth, recentEvents, extraPaidLastMonth, paidOrders] =
    await Promise.all([
      prisma.client.findUnique({
        where: { id: clientId },
        include: {
          sites: {
            include: {
              domains: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      prisma.subscription.findFirst({
        where: { clientId, status: { not: 'canceled' } },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      }),
      // Conta apenas tipos de alteração que consomem o limite mensal (correções não contam)
      prisma.ticket.count({
        where: {
          clientId,
          createdAt: { gte: startOfMonth },
          changeType: { in: ['texto', 'imagem', 'texto_e_imagem'] },
        },
      }),
      prisma.notification.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Alterações avulsas pagas no último mês (para o card de oferta contextual)
      prisma.ticket.count({
        where: {
          clientId,
          isExtraPaid: true,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      // Produtos já adquiridos (para determinar o próximo upsell)
      prisma.order.findMany({
        where: { clientId, status: 'paid' },
        select: { productId: true },
      }),
    ])

  if (!client) redirect('/login')

  // ── Tela de ativação ─────────────────────────────────────────────────────────
  const pendingSite = client.sites.find((s) => s.status === 'pendente_ativacao')
  const hasActiveSubscription = subscription?.status === 'active'
  const hasPendingSubscription = subscription?.status === 'pending'
  const showActivation = !!pendingSite && !hasActiveSubscription

  if (showActivation && !client.monthlyFeeAcknowledgedAt) {
    await prisma.client.update({
      where: { id: clientId },
      data: { monthlyFeeAcknowledgedAt: now },
    })
  }

  if (showActivation && pendingSite) {
    return (
      <ActivationScreen
        siteId={pendingSite.id}
        filesZipUrl={pendingSite.filesZipUrl}
        pendingPayment={hasPendingSubscription}
      />
    )
  }

  // ── Oferta contextual ─────────────────────────────────────────────────────────
  // Determina qual o único card de oferta que aparece no topo do dashboard,
  // em ordem de prioridade definida no produto.
  const primarySite = client.sites[0] ?? null
  const primarySiteType = (primarySite?.siteType as string | undefined) ?? 'mini_site'
  const planDiscount = subscription?.plan.discountPercent ?? 0
  const planMonthlyChanges = subscription?.plan.monthlyChangesIncluded ?? 0
  const ownedProductIds = paidOrders.map((o) => o.productId)

  // Busca upgrade de site elegível para o siteType do cliente
  const allUpgradeProducts = await prisma.product.findMany({
    where: { type: 'upgrade_site' },
    orderBy: { price: 'asc' },
  })
  const clientEntryFee = client.siteEntryFee != null ? Number(client.siteEntryFee) : 0
  const eligibleSiteUpgrade = allUpgradeProducts.find(
    (p) =>
      !ownedProductIds.includes(p.id) &&
      (p.eligibleSiteTypes?.split(',') ?? []).includes(primarySiteType) &&
      clientEntryFee < Number(p.price),
  )

  let contextualOffer: ContextualOffer = null

  if (eligibleSiteUpgrade) {
    // (a) Existe upgrade de site disponível para o tipo atual (mini_site ou landing_page)
    const originalPrice = Number(eligibleSiteUpgrade.price)
    const discountedPrice =
      planDiscount > 0 ? Math.round(originalPrice * (1 - planDiscount / 100) * 100) / 100 : null
    contextualOffer = {
      kind: 'upgrade_landing',
      upgradeName: eligibleSiteUpgrade.name,
      originalPrice,
      discountedPrice,
      planDiscount,
    }
  } else if (planMonthlyChanges === 0) {
    // (b) Plano Básico — visitas bloqueadas
    contextualOffer = { kind: 'visits_locked' }
  } else if (extraPaidLastMonth > 0 && planMonthlyChanges === 0) {
    // (c) Plano Básico e pagou alteração avulsa — sugerir upgrade para Plus
    contextualOffer = { kind: 'plan_pitch' }
  } else {
    // (d) Próximo upsell disponível não adquirido
    const nextUpsell = await prisma.product.findFirst({
      where: {
        id: { notIn: ownedProductIds },
        type: { not: 'upgrade_site' },
      },
      orderBy: { price: 'asc' },
    })
    if (nextUpsell) {
      const originalPrice = Number(nextUpsell.price)
      const discountedPrice =
        planDiscount > 0
          ? Math.round(originalPrice * (1 - planDiscount / 100) * 100) / 100
          : null
      contextualOffer = {
        kind: 'upsell',
        productId: nextUpsell.id,
        name: nextUpsell.name,
        originalPrice,
        discountedPrice,
        planDiscount,
      }
    }
  }

  // ── Analytics (somente para plano Plus com analyticsSiteId configurado) ───────
  const isPlus = (subscription?.plan.monthlyChangesIncluded ?? 0) >= 1
  const analyticsSiteId = client.sites[0]?.analyticsSiteId ?? null
  let analyticsResult: AnalyticsResult | null = null

  if (isPlus && analyticsSiteId) {
    const sinceDate = new Date(now.getFullYear(), now.getMonth(), 1)
    const untilDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    analyticsResult = await getSiteAnalytics(analyticsSiteId, fmt(sinceDate), fmt(untilDate))
  }

  // ── Dados para o Dashboard ──────────────────────────────────────────────────
  const sites = client.sites.map((s) => ({
    id: s.id,
    status: s.status as string,
    siteType: s.siteType as string,
    siteUrl: s.siteUrl,
    filesZipUrl: s.filesZipUrl,
    domain: s.domains[0]
      ? {
          domain: s.domains[0].domain,
          dnsStatus: s.domains[0].dnsStatus as string,
          sslStatus: s.domains[0].sslStatus as string,
        }
      : null,
  }))

  const subData = subscription
    ? {
        planName: subscription.plan.name,
        planPrice: Number(subscription.plan.price),
        status: subscription.status as string,
        nextDueDate: subscription.nextDueDate?.toISOString() ?? null,
        planActivatedAt: subscription.planActivatedAt.toISOString(),
        plan: {
          monthlyChangesIncluded: subscription.plan.monthlyChangesIncluded,
          allowedChangeTypes: subscription.plan.allowedChangeTypes,
          changeDeadlineDays: subscription.plan.changeDeadlineDays,
          discountPercent: subscription.plan.discountPercent,
        },
      }
    : null

  const events = recentEvents.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    createdAt: n.createdAt.toISOString(),
    read: n.read,
  }))

  return (
    <Dashboard
      sites={sites}
      subscription={subData}
      ticketsUsedThisMonth={ticketsUsedThisMonth}
      recentEvents={events}
      contextualOffer={contextualOffer}
      analytics={analyticsResult}
    />
  )
}
