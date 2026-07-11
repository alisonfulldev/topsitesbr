import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PromocoesPageClient, type PromoRow } from './_components/PromocoesPageClient'

// Products that appear in the store (eligible to link a promotion)
const HIDDEN_PRODUCT_NAMES = new Set([
  'Nova Seção',
  'Nova Página',
  'Alteração de Texto (avulsa)',
  'Alteração de Imagem (avulsa)',
  'Alteração de Texto e Imagem (avulsa)',
])

export default async function AdminPromocoesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const [promotions, products] = await Promise.all([
    prisma.promotion.findMany({
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      orderBy: { name: 'asc' },
    }),
  ])

  const promoRows: PromoRow[] = promotions.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    productId: p.productId,
    productName: p.product?.name ?? null,
    discountType: p.discountType,
    discountValue: Number(p.discountValue),
    startDate: p.startDate.toISOString(),
    endDate: p.endDate.toISOString(),
    active: p.active,
  }))

  const productOptions = products
    .filter((p) => !HIDDEN_PRODUCT_NAMES.has(p.name))
    .map((p) => ({ id: p.id, name: p.name }))

  const activeCount = promotions.filter((p) => p.active).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Promoções</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeCount} promoção{activeCount !== 1 ? 'ões' : ''} ativa{activeCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <PromocoesPageClient promotions={promoRows} products={productOptions} />
    </div>
  )
}
