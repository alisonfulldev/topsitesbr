'use client'

import { useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { purchaseProduct } from '../actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import {
  RocketIcon, BuildingIcon, ShoppingCartIcon, PaletteIcon,
  SearchIcon, TrendingUpIcon, GlobeIcon, MailIcon,
  MessageCircleIcon, PencilIcon, ZapIcon, TagIcon,
} from '@/components/ui/icons'

export type ProductRow = {
  id: string
  name: string
  type: string
  basePrice: number
  finalPrice: number
  planDiscountPercent: number
  promoTitle: string | null
  promoDiscountLabel: string | null
  periodLabel?: string
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
  return Math.max(0, Math.ceil((new Date(isoDate).getTime() - Date.now()) / 86_400_000))
}

const PRODUCT_META: Array<{ keywords: string[]; icon: ReactNode; benefit: string }> = [
  { keywords: ['landing'], icon: <RocketIcon className="w-5 h-5" />, benefit: 'Converta mais visitantes em clientes' },
  { keywords: ['institucional'], icon: <BuildingIcon className="w-5 h-5" />, benefit: 'Presença profissional com múltiplas páginas' },
  { keywords: ['loja', 'virtual'], icon: <ShoppingCartIcon className="w-5 h-5" />, benefit: 'Venda seus produtos direto pelo site' },
  { keywords: ['logo', 'identidade'], icon: <PaletteIcon className="w-5 h-5" />, benefit: 'Identidade visual que passa credibilidade imediata' },
  { keywords: ['seo', 'google', 'posicion'], icon: <SearchIcon className="w-5 h-5" />, benefit: 'Apareça no Google quando buscarem pelo seu negócio' },
  { keywords: ['tráfego', 'trafego', 'ads', 'campanha'], icon: <TrendingUpIcon className="w-5 h-5" />, benefit: 'Atraia clientes que ainda não te conhecem' },
  { keywords: ['domínio', 'dominio'], icon: <GlobeIcon className="w-5 h-5" />, benefit: 'Endereço próprio como seunegocio.com.br' },
  { keywords: ['e-mail', 'email'], icon: <MailIcon className="w-5 h-5" />, benefit: 'voce@seunegocio.com.br — credibilidade desde o 1º contato' },
  { keywords: ['whatsapp'], icon: <MessageCircleIcon className="w-5 h-5" />, benefit: 'Atendimento profissional com catálogo e métricas' },
  { keywords: ['blog'], icon: <PencilIcon className="w-5 h-5" />, benefit: 'Conteúdo que atrai visitantes mês após mês' },
]

function getProductMeta(name: string): { icon: ReactNode; benefit: string } {
  const lower = name.toLowerCase()
  for (const meta of PRODUCT_META) {
    if (meta.keywords.some((k) => lower.includes(k))) return meta
  }
  return { icon: <ZapIcon className="w-5 h-5" />, benefit: 'Potencialize sua presença online' }
}

function ProductCard({
  product,
  planName,
  whatsappNumber,
}: {
  product: ProductRow
  planName: string | null
  whatsappNumber: string
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const { icon, benefit } = getProductMeta(product.name)
  const hasDiscount = product.finalPrice < product.basePrice
  const isFree = product.finalPrice === 0
  const hasPromo = !!product.promoTitle
  const isWhatsappLead = product.type === 'whatsapp_lead'

  function handleBuy() {
    if (isWhatsappLead) {
      const msg = encodeURIComponent(`Olá! Tenho interesse na Loja Virtual para o meu site. Pode me dar mais informações?`)
      window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, '_blank')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await purchaseProduct(product.id)
      if (result.error) {
        setError(result.error)
        return
      }
      if (result.paymentUrl) window.location.href = result.paymentUrl
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col hover:border-brand-200 hover:shadow-sm transition-all">
      {/* Icon */}
      <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center mb-4 text-gray-600">
        {icon}
      </div>

      {/* Title + promo badge */}
      <div className="flex items-start gap-2 mb-1">
        <h3 className="font-semibold text-gray-900 text-base leading-snug flex-1">{product.name}</h3>
        {hasPromo && <Badge variant="orange">Promoção</Badge>}
      </div>

      {/* Benefit phrase */}
      <p className="text-sm text-gray-500 leading-snug mb-4 flex-1">{benefit}</p>

      {/* Price */}
      <div className="mb-4">
        {hasDiscount && (
          <p className="text-sm text-gray-400 line-through">R$ {fmt(product.basePrice)}</p>
        )}
        <p className="text-2xl font-bold text-gray-900">
          {isFree ? 'Gratuito' : (
            <>
              {isWhatsappLead && <span className="text-sm font-normal text-gray-500 mr-1">a partir de</span>}
              R$ {fmt(isWhatsappLead ? product.basePrice : product.finalPrice)}
              {product.periodLabel && (
                <span className="text-sm font-normal text-gray-500 ml-1">{product.periodLabel}</span>
              )}
            </>
          )}
        </p>
        {!isWhatsappLead && hasPromo && product.promoDiscountLabel && (
          <p className="text-xs text-orange-600 font-medium mt-0.5">
            {product.promoDiscountLabel} de desconto
          </p>
        )}
        {!isWhatsappLead && !hasPromo && product.planDiscountPercent > 0 && planName && (
          <p className="text-xs text-brand-text font-medium mt-0.5">
            {product.planDiscountPercent}% de desconto — plano {planName}
          </p>
        )}
      </div>

      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

      <Button variant="conversion" size="md" fullWidth onClick={handleBuy} loading={isPending}>
        {isWhatsappLead ? 'Falar com especialista' : 'Comprar'}
      </Button>
    </div>
  )
}

export function UpgradesClient({
  products,
  promoBanners,
  planName,
  whatsappNumber,
}: {
  products: ProductRow[]
  promoBanners: PromoBanner[]
  planName: string | null
  whatsappNumber: string
}) {
  const searchParams = useSearchParams()
  const paid = searchParams.get('pago') === '1'

  const upgradeProducts = products.filter((p) => p.type === 'upgrade_site')
  const otherProducts = products.filter((p) => p.type !== 'upgrade_site')

  return (
    <div className="space-y-8">
      {paid && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-green-800">Pagamento recebido!</p>
            <p className="text-sm text-green-700 mt-0.5">
              Seu pedido foi confirmado. Entraremos em contato em breve para dar início ao serviço.
            </p>
          </div>
        </div>
      )}
      {/* Active promotion banners */}
      {promoBanners.length > 0 && (
        <div className="space-y-3">
          {promoBanners.map((promo) => {
            const days = daysLeft(promo.endDate)
            return (
              <div
                key={promo.id}
                className="rounded-xl bg-orange-50 border border-orange-200 px-5 py-4 flex items-start gap-4"
              >
                <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <TagIcon className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-orange-800">{promo.title}</p>
                  {promo.description && (
                    <p className="text-sm text-orange-700 mt-0.5">{promo.description}</p>
                  )}
                  <p className="text-sm text-orange-600 mt-0.5">
                    {promo.productName ? (
                      <>
                        Válido para: <strong>{promo.productName}</strong>
                        {' — '}
                      </>
                    ) : (
                      'Todos os produtos — '
                    )}
                    {promo.discountType === 'percent'
                      ? `${promo.discountValue}% de desconto`
                      : `R$ ${fmt(promo.discountValue)} de desconto`}
                  </p>
                </div>
                <Badge variant="orange">
                  {days === 0 ? 'Último dia!' : `${days}d restante${days !== 1 ? 's' : ''}`}
                </Badge>
              </div>
            )
          })}
        </div>
      )}

      {/* Upgrade de site */}
      {upgradeProducts.length > 0 && (
        <section>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Upgrade do seu site</h3>
          <p className="text-sm text-gray-500 mb-4">
            Evolua para um site mais completo e converta mais
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upgradeProducts.map((p) => (
              <ProductCard key={p.id} product={p} planName={planName} whatsappNumber={whatsappNumber} />
            ))}
          </div>
        </section>
      )}

      {/* Serviços e complementos */}
      {otherProducts.length > 0 && (
        <section>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Serviços e complementos</h3>
          <p className="text-sm text-gray-500 mb-4">
            Ferramentas para crescer e profissionalizar sua presença online
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherProducts.map((p) => (
              <ProductCard key={p.id} product={p} planName={planName} whatsappNumber={whatsappNumber} />
            ))}
          </div>
        </section>
      )}

      {products.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState title="Nenhum serviço disponível no momento." className="py-8" />
        </div>
      )}
    </div>
  )
}
