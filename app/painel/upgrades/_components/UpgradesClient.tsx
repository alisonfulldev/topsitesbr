'use client'

import { useState, useTransition } from 'react'
import { purchaseProduct } from '../actions'

export type ProductRow = {
  id: string
  name: string
  type: string
  basePrice: number
  finalPrice: number
  planDiscountPercent: number
  promoTitle: string | null
  promoDiscountLabel: string | null
}

export type PromoBanner = {
  id: string
  title: string
  description: string | null
  productId: string | null
  productName: string | null
  discountType: string
  discountValue: number
  endDate: string
}

function fmt(value: number): string {
  return value.toFixed(2).replace('.', ',')
}

function daysLeft(isoDate: string): number {
  const diff = new Date(isoDate).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86_400_000))
}

function ProductCard({
  product,
  planName,
}: {
  product: ProductRow
  planName: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const hasDiscount = product.finalPrice < product.basePrice
  const isFree = product.finalPrice === 0

  function handleBuy() {
    setError(null)
    startTransition(async () => {
      const result = await purchaseProduct(product.id)
      if (result.error) {
        setError(result.error)
        return
      }
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl
      }
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 hover:border-brand-200 transition-colors">
      <div className="flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-text mb-1">
          {product.type === 'upgrade_site' ? 'Upgrade de Site' : product.type === 'addon' ? 'Complemento' : 'Serviço'}
        </p>
        <h3 className="font-semibold text-gray-900 text-base">{product.name}</h3>

        {product.promoTitle && (
          <p className="mt-1 text-xs text-orange-600 font-medium">
            Promoção: {product.promoTitle}
            {product.promoDiscountLabel && ` — ${product.promoDiscountLabel}`}
          </p>
        )}
        {!product.promoTitle && product.planDiscountPercent > 0 && (
          <p className="mt-1 text-xs text-brand-text font-medium">
            Seu plano {planName} dá {product.planDiscountPercent}% off
          </p>
        )}
      </div>

      <div>
        {hasDiscount && (
          <p className="text-sm text-gray-400 line-through">R$ {fmt(product.basePrice)}</p>
        )}
        <p className="text-2xl font-bold text-gray-900">
          {isFree ? 'Gratuito' : `R$ ${fmt(product.finalPrice)}`}
        </p>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        onClick={handleBuy}
        disabled={isPending}
        className="w-full py-2 rounded-lg bg-brand text-brand-dark text-sm font-semibold hover:bg-brand-hover disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Processando…' : 'Comprar'}
      </button>
    </div>
  )
}

export function UpgradesClient({
  products,
  promoBanners,
  planName,
}: {
  products: ProductRow[]
  promoBanners: PromoBanner[]
  planName: string | null
}) {
  const upgradeProducts = products.filter((p) => p.type === 'upgrade_site')
  const otherProducts = products.filter((p) => p.type !== 'upgrade_site')

  return (
    <div className="space-y-8">
      {/* Active promotion banners */}
      {promoBanners.length > 0 && (
        <div className="space-y-3">
          {promoBanners.map((promo) => {
            const days = daysLeft(promo.endDate)
            return (
              <div
                key={promo.id}
                className="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 px-5 py-4 flex items-start gap-4"
              >
                <span className="text-2xl">🔥</span>
                <div className="flex-1">
                  <p className="font-semibold text-orange-800">{promo.title}</p>
                  {promo.description && (
                    <p className="text-sm text-orange-700 mt-0.5">{promo.description}</p>
                  )}
                  {promo.productName && (
                    <p className="text-sm text-orange-600 mt-0.5">
                      Válido para: <strong>{promo.productName}</strong>
                      {' — '}
                      {promo.discountType === 'percent'
                        ? `${promo.discountValue}% de desconto`
                        : `R$ ${fmt(promo.discountValue)} de desconto`}
                    </p>
                  )}
                  {!promo.productName && (
                    <p className="text-sm text-orange-600 mt-0.5">
                      {promo.discountType === 'percent'
                        ? `${promo.discountValue}% de desconto em todos os produtos`
                        : `R$ ${fmt(promo.discountValue)} de desconto em todos os produtos`}
                    </p>
                  )}
                </div>
                <p className="text-xs text-orange-500 whitespace-nowrap">
                  {days === 0 ? 'Último dia!' : `${days} dia${days !== 1 ? 's' : ''} restante${days !== 1 ? 's' : ''}`}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Upgrade de site */}
      {upgradeProducts.length > 0 && (
        <section>
          <h3 className="text-base font-semibold text-gray-900 mb-3">Upgrade do seu site</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upgradeProducts.map((p) => (
              <ProductCard key={p.id} product={p} planName={planName} />
            ))}
          </div>
        </section>
      )}

      {/* Other services & addons */}
      {otherProducts.length > 0 && (
        <section>
          <h3 className="text-base font-semibold text-gray-900 mb-3">Serviços e complementos</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherProducts.map((p) => (
              <ProductCard key={p.id} product={p} planName={planName} />
            ))}
          </div>
        </section>
      )}

      {products.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-400">
          Nenhum serviço disponível no momento.
        </div>
      )}
    </div>
  )
}
