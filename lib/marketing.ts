import type { Metadata } from 'next'

export const SITE_URL = 'https://topsitebr.com.br'
export const BRAND_DESCRIPTION = 'Site profissional por apenas R$ 97/mês: site institucional one page com serviços, fotos, contatos e botão de WhatsApp, adaptado ao celular.'

export const marketingServices = [
  { href: '/criacao-de-sites', label: 'Criação de sites' },
  { href: '/site-institucional', label: 'Site institucional' },
  { href: '/landing-page', label: 'Landing pages' },
  { href: '/pagina-de-vendas', label: 'Página de vendas' },
  { href: '/pagina-de-lancamento', label: 'Página de lançamento' },
  { href: '/pagina-de-captura', label: 'Página de captura' },
  { href: '/loja-virtual', label: 'Lojas virtuais' },
]

// Oferta principal do site de divulgação — o preço é o grande diferencial
export const offer = {
  price: 'R$ 97/mês',
  // Partes do preço para o destaque grande do box ("R$ 97" + "/mês" menor), como na home
  amount: 'R$ 97',
  period: '/mês',
  product: 'Site institucional one page',
  deliverables: [
    { title: 'Site institucional one page', text: 'Sua empresa, seus serviços, fotos e contatos reunidos em uma página profissional.' },
    { title: 'Adaptado ao celular', text: 'Fica bonito e fácil de usar no celular, no tablet e no computador.' },
    { title: 'Botão de WhatsApp em destaque', text: 'Quem visita seu site fala com você em um clique.' },
  ],
}

// Condições da oferta mensal — os mesmos destaques do box de preço da home, em todas as páginas
export const offerHighlights = [
  { icon: 'clock', label: 'Primeira parcela após 30 dias.' },
  { icon: 'calendar', label: 'Durante 12 meses' },
  { icon: 'search', label: '+ Configuração SEO' },
  { icon: 'pin', label: '+ Google Meu Negócio' },
] as const

// JSON-LD da oferta: R$ 97 cobrados por mês
export const monthlyOfferSchema = {
  '@type': 'Offer',
  price: '97',
  priceCurrency: 'BRL',
  priceSpecification: { '@type': 'UnitPriceSpecification', price: '97', priceCurrency: 'BRL', unitCode: 'MON', unitText: 'mês' },
}

export const offerPriceAnswer = 'O site institucional one page sai por R$ 97/mês, com a primeira parcela só após 30 dias e duração de 12 meses. Ele reúne em uma página a apresentação da sua empresa, seus serviços, fotos, contatos e botão de WhatsApp, adaptado ao celular.'

// Âncoras da home — usadas também na navegação do rodapé
export const homeAnchors = {
  why: 'por-que-a-top-site',
  services: 'servicos',
  process: 'como-trabalhamos',
  pricing: 'investimento',
  faq: 'perguntas-frequentes',
  contact: 'solicitar-orcamento',
}

// Opções do formulário "Vamos conversar sobre o seu projeto?" da home
export const SITE_TYPES = [
  'Criação de sites',
  'Site institucional',
  'Landing page',
  'Página de lançamento',
  'Página de captura',
  'Loja virtual',
  'Outro',
] as const

// E-mail oficial de contato (também usado no JSON-LD)
export const CONTACT_EMAIL = 'contato@topsitebr.com.br'

export const DEFAULT_WHATSAPP_MESSAGE = 'Olá! Quero meu site por R$ 97/mês.'

export function projectContact(message = DEFAULT_WHATSAPP_MESSAGE) {
  return 'https://wa.me/5518996742364?text=' + encodeURIComponent(message)
}

export function marketingMetadata(title: string, description: string, path = ''): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title, description,
    alternates: { canonical: SITE_URL + path },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
    openGraph: {
      type: 'website', title, description, url: SITE_URL + path,
      siteName: 'TopSite', locale: 'pt_BR',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TopSite — Site profissional por R$ 97/mês' }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-image.png'] },
  }
}

export const organizationSchema = {
  '@type': 'Organization',
  '@id': SITE_URL + '/#organization',
  name: 'TopSite', url: SITE_URL, logo: SITE_URL + '/logo.png',
  description: BRAND_DESCRIPTION,
  telephone: '+55-18-99674-2364',
  email: CONTACT_EMAIL,
  areaServed: { '@type': 'Country', name: 'Brazil' },
  contactPoint: {
    '@type': 'ContactPoint', contactType: 'customer service',
    telephone: '+55-18-99674-2364', availableLanguage: 'Portuguese',
  },
}

