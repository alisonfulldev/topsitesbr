import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { UpgradesClient, type ProductRow, type PromoBanner } from './_components/UpgradesClient'

// Products that should NOT appear in the store
const HIDDEN_PRODUCT_NAMES = new Set([
  'Nova Seção',
  'Nova Página',
  'Alteração de Texto (avulsa)',
  'Alteração de Imagem (avulsa)',
  'Alteração de Texto e Imagem (avulsa)',
])

export default async function UpgradesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { clientId: true },
  })
  const clientId = user?.clientId
  if (!clientId) redirect('/painel')

  const [client, allProducts, now] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      include: {
        subscriptions: {
          where: { status: { not: 'canceled' } },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        sites: { select: { siteType: true } },
      },
    }),
    prisma.product.findMany({ orderBy: { price: 'asc' } }),
    Promise.resolve(new Date()),
  ])

  if (!client) redirect('/painel')

  const subscription = client.subscriptions[0] ?? null
  const plan = subscription?.plan ?? null
  const planDiscountPercent = plan?.discountPercent ?? 0

  // Determine client's primary site type (first site, if any)
  const clientSiteType = client.sites[0]?.siteType ?? null

  // Active promotions
  const activePromos = await prisma.promotion.findMany({
    where: {
      active: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: { product: { select: { id: true, name: true } } },
    orderBy: { endDate: 'asc' },
  })

  // Helper: compute best promo discount amount for a given product and base price
  function bestPromoAmount(productId: string, basePrice: number): {
    amount: number
    title: string | null
    label: string | null
  } {
    let best = { amount: 0, title: null as string | null, label: null as string | null }
    for (const promo of activePromos) {
      if (promo.productId !== null && promo.productId !== productId) continue
      const amount =
        promo.discountType === 'percent'
          ? basePrice * (Number(promo.discountValue) / 100)
          : Number(promo.discountValue)
      if (amount > best.amount) {
        const label =
          promo.discountType === 'percent'
            ? `${promo.discountValue}% off`
            : `R$ ${Number(promo.discountValue).toFixed(2).replace('.', ',')} off`
        best = { amount, title: promo.title, label }
      }
    }
    return best
  }

  // Build product rows, filtering hidden products + upgrade_site by siteType
  const products: ProductRow[] = []

  for (const product of allProducts) {
    if (HIDDEN_PRODUCT_NAMES.has(product.name)) continue

    // For upgrade_site, only show if client's current siteType is in the eligible list
    if (product.type === 'upgrade_site') {
      const eligible = product.eligibleSiteTypes?.split(',') ?? []
      if (eligible.length === 0 || !clientSiteType || !eligible.includes(clientSiteType as string)) continue
    }

    const basePrice = Number(product.price)
    const planDiscountAmount = basePrice * (planDiscountPercent / 100)
    const promo = bestPromoAmount(product.id, basePrice)

    // Use the higher discount (not cumulative)
    const discountAmount = Math.max(planDiscountAmount, promo.amount)
    const finalPrice = Math.max(0, Math.round((basePrice - discountAmount) * 100) / 100)

    products.push({
      id: product.id,
      name: product.name,
      type: product.type,
      basePrice,
      finalPrice,
      planDiscountPercent: promo.amount >= planDiscountAmount ? 0 : planDiscountPercent,
      promoTitle: promo.amount >= planDiscountAmount ? promo.title : null,
      promoDiscountLabel: promo.amount >= planDiscountAmount ? promo.label : null,
    })
  }

  // Build promotion banners (one per active promo)
  const promoBanners: PromoBanner[] = activePromos.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    productId: p.productId,
    productName: p.product?.name ?? null,
    discountType: p.discountType,
    discountValue: Number(p.discountValue),
    endDate: p.endDate.toISOString(),
  }))

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Serviços e Upgrades</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Potencialize sua presença online com serviços adicionais
          {plan && planDiscountPercent > 0 && (
            <span className="ml-1 font-medium text-brand-text">
              — seu plano {plan.name} dá {planDiscountPercent}% de desconto!
            </span>
          )}
        </p>
      </div>

      <UpgradesClient
        products={products}
        promoBanners={promoBanners}
        planName={plan?.name ?? null}
      />
    </div>
  )
}
