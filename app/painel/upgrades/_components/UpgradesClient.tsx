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

type ProductMeta = {
  keywords: string[]
  icon: ReactNode
  benefit: string
  modalTitle: string
  description: string
  highlights: string[]
}

const PRODUCT_META: ProductMeta[] = [
  {
    keywords: ['landing'],
    icon: <RocketIcon className="w-5 h-5" />,
    benefit: 'Converta mais visitantes em clientes',
    modalTitle: 'Por que fazer upgrade para Landing Page?',
    description:
      'Seu mini site é ótimo para apresentação, mas uma Landing Page é projetada do zero para converter visitantes em clientes — com seção de benefícios, depoimentos, FAQ e um único botão de ação que guia o visitante até o contato ou a compra.',
    highlights: [
      'Estrutura focada em conversão',
      'Seção de depoimentos e prova social',
      'FAQ para eliminar objeções antes da decisão',
      'Design otimizado para mobile e carregamento rápido',
      'Ideal para anúncios e tráfego pago',
    ],
  },
  {
    keywords: ['institucional'],
    icon: <BuildingIcon className="w-5 h-5" />,
    benefit: 'Presença profissional com múltiplas páginas',
    modalTitle: 'Por que fazer upgrade para Site Institucional?',
    description:
      'Um site com múltiplas páginas passa muito mais credibilidade. Inclui página Sobre, Serviços, Portfólio e Contato — tudo organizado para que qualquer visitante encontre o que precisa e chegue até você com confiança.',
    highlights: [
      'Múltiplas páginas: Home, Sobre, Serviços e Contato',
      'Portfólio ou galeria de trabalhos',
      'Formulário de contato integrado',
      'SEO estruturado por página',
      'Credibilidade que grandes empresas transmitem',
    ],
  },
  {
    keywords: ['loja', 'virtual'],
    icon: <ShoppingCartIcon className="w-5 h-5" />,
    benefit: 'Venda seus produtos direto pelo site',
    modalTitle: 'Por que ter uma Loja Virtual?',
    description:
      'Se você vende produtos ou serviços com valor definido, uma loja integrada ao seu site permite que o cliente compre direto — sem precisar passar pelo WhatsApp para cada pedido.',
    highlights: [
      'Catálogo completo com fotos e preços',
      'Carrinho de compras e checkout próprio',
      'Integração com Pix, boleto e cartão',
      'Painel para gerenciar pedidos',
      'Notificação automática a cada venda',
    ],
  },
  {
    keywords: ['logo', 'identidade'],
    icon: <PaletteIcon className="w-5 h-5" />,
    benefit: 'Identidade visual que passa credibilidade imediata',
    modalTitle: 'Por que ter um logo profissional?',
    description:
      'A primeira impressão do seu negócio começa pelo visual. Um logo feito por profissional transmite confiança e faz seu negócio parecer estabelecido — seja no cartão de visita, no WhatsApp Business ou no próprio site.',
    highlights: [
      'Arquivos em PNG, SVG e PDF prontos para usar',
      'Versões horizontal e vertical',
      'Paleta de cores e tipografia definidas',
      'Identidade visual completa para qualquer canal',
      'Revisões incluídas até sua aprovação',
    ],
  },
  {
    keywords: ['seo', 'google', 'posicion'],
    icon: <SearchIcon className="w-5 h-5" />,
    benefit: 'Apareça no Google quando buscarem pelo seu negócio',
    modalTitle: 'Por que investir em SEO?',
    description:
      'SEO é o que faz seu site aparecer nos resultados do Google sem pagar por anúncio. Com a configuração certa, pessoas que buscam pelo que você oferece encontram seu negócio — todo dia, sem custo adicional.',
    highlights: [
      'Configuração completa de títulos e descrições',
      'Google Search Console e Analytics configurados',
      'Mapa do site enviado ao Google',
      'Velocidade e performance otimizadas',
      'Relatório inicial de posicionamento',
    ],
  },
  {
    keywords: ['tráfego', 'trafego', 'ads', 'campanha'],
    icon: <TrendingUpIcon className="w-5 h-5" />,
    benefit: 'Atraia clientes que ainda não te conhecem',
    modalTitle: 'Por que investir em tráfego pago?',
    description:
      'Com seu site no ar, o próximo passo é trazer visitantes que ainda não te conhecem. Configuramos sua campanha no Meta Ads ou Google Ads para que seu site apareça para as pessoas certas, no momento certo.',
    highlights: [
      'Configuração completa da campanha',
      'Definição de público-alvo ideal para o seu negócio',
      'Criativo (arte) para o anúncio incluído',
      'Relatório de desempenho ao final',
      'Sem fidelidade — você controla o investimento',
    ],
  },
  {
    keywords: ['domínio', 'dominio'],
    icon: <GlobeIcon className="w-5 h-5" />,
    benefit: 'Endereço próprio como seunegocio.com.br',
    modalTitle: 'Por que ter um domínio próprio?',
    description:
      'seunegocio.com.br é muito mais fácil de divulgar e passa muito mais confiança do que um link genérico. Qualquer pessoa que pesquisar seu negócio no Google vai encontrar um endereço que parece sério e estabelecido.',
    highlights: [
      'Registro do domínio .com.br por 1 ano',
      'Configuração de DNS incluída',
      'Certificado SSL (cadeado verde) ativado',
      'E-mail de lembrete antes da renovação anual',
      'Seu negócio no endereço que você escolheu',
    ],
  },
  {
    keywords: ['e-mail', 'email'],
    icon: <MailIcon className="w-5 h-5" />,
    benefit: 'voce@seunegocio.com.br — credibilidade desde o 1º contato',
    modalTitle: 'Por que ter e-mail profissional?',
    description:
      'voce@seunegocio.com.br causa uma impressão completamente diferente de um Gmail. No primeiro e-mail que você enviar para um cliente potencial, já aparece que é um negócio sério e organizado.',
    highlights: [
      'E-mail com o seu próprio domínio',
      'Configuração no celular e no computador',
      'Sem limite de armazenamento generoso',
      'Assinatura profissional configurada',
      'Acesso via web ou qualquer aplicativo de e-mail',
    ],
  },
  {
    keywords: ['whatsapp'],
    icon: <MessageCircleIcon className="w-5 h-5" />,
    benefit: 'Atendimento profissional com catálogo e métricas',
    modalTitle: 'Por que configurar o WhatsApp Business?',
    description:
      'O WhatsApp Business vai muito além de troca de mensagens. Com catálogo de produtos/serviços, respostas automáticas e etiquetas de clientes, seu atendimento fica organizado, rápido e profissional.',
    highlights: [
      'Perfil comercial completo configurado',
      'Catálogo de produtos ou serviços',
      'Mensagens automáticas de boas-vindas e ausência',
      'Etiquetas para organizar conversas por etapa',
      'Link direto para o seu número para divulgar no site',
    ],
  },
  {
    keywords: ['blog'],
    icon: <PencilIcon className="w-5 h-5" />,
    benefit: 'Conteúdo que atrai visitantes mês após mês',
    modalTitle: 'Por que ter um blog no seu site?',
    description:
      'Cada artigo publicado é uma nova porta de entrada no Google. Um blog bem feito atrai visitantes mês após mês sem custo de anúncios — são pessoas buscando exatamente o que você oferece.',
    highlights: [
      'Seção de blog integrada ao seu site',
      'Layout profissional e fácil de ler',
      'Primeiros 3 artigos incluídos na configuração',
      'Otimizado para SEO desde o primeiro post',
      'Você mesmo publica novos artigos depois, sem custo',
    ],
  },
]

function getProductMeta(name: string): ProductMeta {
  const lower = name.toLowerCase()
  for (const meta of PRODUCT_META) {
    if (meta.keywords.some((k) => lower.includes(k))) return meta
  }
  return {
    icon: <ZapIcon className="w-5 h-5" />,
    benefit: 'Potencialize sua presença online',
    keywords: [],
    modalTitle: name,
    description: 'Expanda as possibilidades do seu negócio digital com este serviço.',
    highlights: [],
  }
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function ProductModal({
  product,
  meta,
  planName,
  whatsappNumber,
  onClose,
}: {
  product: ProductRow
  meta: ProductMeta
  planName: string | null
  whatsappNumber: string
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const hasDiscount = product.finalPrice < product.basePrice
  const isFree = product.finalPrice === 0
  const isWhatsappLead = product.type === 'whatsapp_lead'

  function handleBuy() {
    if (isWhatsappLead) {
      const msg = encodeURIComponent(`Olá! Tenho interesse em ${product.name} para o meu site. Pode me dar mais informações?`)
      window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, '_blank')
      onClose()
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
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
              {meta.icon}
            </div>
            <h2 className="text-base font-bold text-gray-900 leading-snug">{meta.modalTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-0.5"
            aria-label="Fechar"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed">{meta.description}</p>

          {/* Highlights */}
          {meta.highlights.length > 0 && (
            <ul className="space-y-2">
              {meta.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckIcon />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Divider + Price */}
          <div className="pt-2 border-t border-gray-100">
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
            {!isWhatsappLead && product.promoDiscountLabel && (
              <p className="text-xs text-orange-600 font-medium mt-0.5">
                {product.promoDiscountLabel} de desconto
              </p>
            )}
            {!isWhatsappLead && !product.promoTitle && product.planDiscountPercent > 0 && planName && (
              <p className="text-xs text-brand-text font-medium mt-0.5">
                {product.planDiscountPercent}% de desconto — plano {planName}
              </p>
            )}
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          {/* CTA */}
          <Button
            variant="conversion"
            size="md"
            fullWidth
            onClick={handleBuy}
            loading={isPending}
            loadingText="Processando..."
          >
            {isWhatsappLead ? 'Falar com especialista' : 'Comprar agora'}
          </Button>
        </div>
      </div>
    </div>
  )
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
  const [modalOpen, setModalOpen] = useState(false)

  const meta = getProductMeta(product.name)
  const hasDiscount = product.finalPrice < product.basePrice
  const isFree = product.finalPrice === 0
  const hasPromo = !!product.promoTitle
  const isWhatsappLead = product.type === 'whatsapp_lead'

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col hover:border-brand-200 hover:shadow-sm transition-all">
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center mb-4 text-gray-600">
          {meta.icon}
        </div>

        {/* Title + promo badge */}
        <div className="flex items-start gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-base leading-snug flex-1">{product.name}</h3>
          {hasPromo && <Badge variant="orange">Promoção</Badge>}
        </div>

        {/* Benefit phrase */}
        <p className="text-sm text-gray-500 leading-snug mb-4 flex-1">{meta.benefit}</p>

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

        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={() => setModalOpen(true)}
        >
          Saber mais
        </Button>
      </div>

      {modalOpen && (
        <ProductModal
          product={product}
          meta={meta}
          planName={planName}
          whatsappNumber={whatsappNumber}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
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
