'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPaymentProvider } from '@/lib/payments/provider'
import { revalidatePath } from 'next/cache'

async function getClientId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') return null
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { clientId: true },
  })
  return user?.clientId ?? null
}

export async function purchaseProduct(
  productId: string,
): Promise<{ error?: string; paymentUrl?: string }> {
  const clientId = await getClientId()
  if (!clientId) return { error: 'Não autorizado.' }

  const [client, product] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      include: {
        subscriptions: {
          where: { status: { not: 'canceled' } },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.product.findUnique({ where: { id: productId } }),
  ])

  if (!client) return { error: 'Cliente não encontrado.' }
  if (!product) return { error: 'Produto não encontrado.' }

  const planDiscountPercent = client.subscriptions[0]?.plan.discountPercent ?? 0
  const basePrice = Number(product.price)

  // Find the best active promotion for this product (product-specific or general)
  const now = new Date()
  const promotions = await prisma.promotion.findMany({
    where: {
      active: true,
      startDate: { lte: now },
      endDate: { gte: now },
      OR: [{ productId }, { productId: null }],
    },
  })

  // Plan discount in R$
  const planDiscountAmount = basePrice * (planDiscountPercent / 100)

  // Best promotion discount in R$
  let bestPromoDiscountAmount = 0
  for (const promo of promotions) {
    const amount =
      promo.discountType === 'percent'
        ? basePrice * (Number(promo.discountValue) / 100)
        : Number(promo.discountValue)
    if (amount > bestPromoDiscountAmount) bestPromoDiscountAmount = amount
  }

  // Use the higher of the two (not cumulative)
  const discountAmount = Math.max(planDiscountAmount, bestPromoDiscountAmount)
  const finalPrice = Math.max(0, Math.round((basePrice - discountAmount) * 100) / 100)

  const provider = getPaymentProvider()
  const { customerId } = await provider.createCustomer({
    name: client.name,
    email: client.email,
    document: client.document,
    phone: client.phone,
  })

  const { chargeId, paymentUrl } = await provider.createSingleCharge({
    customerId,
    description: product.name,
    price: finalPrice,
  })

  await prisma.order.create({
    data: {
      clientId,
      productId,
      amount: finalPrice,
      status: 'pending',
      asaasChargeId: chargeId,
    },
  })

  revalidatePath('/painel/upgrades')
  return { paymentUrl }
}
