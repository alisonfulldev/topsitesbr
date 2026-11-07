import type { Metadata } from 'next'

export const SITE_URL = 'https://topsitebr.com.br'
export const BRAND_DESCRIPTION = 'A TopSite cria ou otimiza o seu site para aparecer no Google e nas IAs, como ChatGPT e Gemini, quando o seu cliente pesquisar. Diagnóstico grátis pelo WhatsApp.'

export const marketingServices = [
  { href: '/criacao-de-sites', label: 'Criação de sites' },
  { href: '/otimizacao-de-sites', label: 'Otimização de sites' },
  { href: '/site-institucional', label: 'Site institucional' },
  { href: '/landing-page', label: 'Landing pages' },
  { href: '/pagina-de-vendas', label: 'Página de vendas' },
  { href: '/pagina-de-lancamento', label: 'Página de lançamento' },
  { href: '/pagina-de-captura', label: 'Página de captura' },
  { href: '/loja-virtual', label: 'Lojas virtuais' },
]

// Textos de todos os botões do site de divulgação — nenhuma página escreve rótulo de botão por conta própria
export const ctaLabels = {
  // Todo botão que abre o WhatsApp
  whatsapp: 'Diagnóstico grátis no WhatsApp',
  // Botões que levam ao box do diagnóstico na mesma página
  anchor: 'Quero o diagnóstico grátis',
  // Envio do formulário de contato
  form: 'Pedir diagnóstico grátis',
  // Cartões que levam a uma página de serviço
  learnMore: 'Saiba mais',
}

// Linha de apoio que acompanha os botões de WhatsApp
export const ctaNote = 'Grátis e sem compromisso · Atendimento em todo o Brasil'

// Oferta de entrada do site de divulgação: o diagnóstico grátis (sem preços nas páginas públicas)
export const offer = {
  name: 'Diagnóstico grátis',
  headline: 'Seu site no Google e nas IAs.',
  subheadline: 'Criamos ou otimizamos seu site para aparecer quando seu cliente pesquisar.',
  deliverables: [
    { title: 'Como você aparece no Google', text: 'Pesquisamos o seu negócio do jeito que o seu cliente pesquisa e mostramos quem aparece primeiro.' },
    { title: 'O que as IAs dizem sobre você', text: 'Vemos se o ChatGPT, o Gemini e outras IAs citam a sua empresa quando alguém pede uma indicação do seu segmento.' },
    { title: 'Por onde começar', text: 'Você recebe os ajustes mais importantes para o seu site — ou o caminho para criar um, se ainda não tiver.' },
  ],
}

// Selos do box do diagnóstico — os mesmos em todas as páginas
export const offerHighlights = [
  { icon: 'check', label: 'Grátis e sem compromisso' },
  { icon: 'search', label: 'Google' },
  { icon: 'sparkle', label: 'ChatGPT e Gemini' },
  { icon: 'pin', label: 'Google Meu Negócio' },
] as const

// Resposta padrão para "Quanto custa?" — o valor só é passado depois do diagnóstico
export const offerPriceAnswer = 'Depende do ponto de partida: criar um site novo ou otimizar o que você já tem. Por isso começamos com um diagnóstico grátis e sem compromisso — você vê como o seu negócio aparece hoje no Google e nas IAs e recebe a proposta antes de decidir qualquer coisa.'

// Âncoras da home — usadas também na navegação do rodapé
export const homeAnchors = {
  why: 'por-que-a-top-site',
  services: 'servicos',
  process: 'como-trabalhamos',
  pricing: 'diagnostico-gratis',
  faq: 'perguntas-frequentes',
  contact: 'solicitar-orcamento',
}

// Opções do formulário de contato da home
export const SITE_TYPES = [
  'Criar um site novo',
  'Otimizar o site que já tenho',
  'Site institucional',
  'Landing page',
  'Página de lançamento',
  'Página de captura',
  'Loja virtual',
  'Outro',
] as const

// E-mail oficial de contato (também usado no JSON-LD)
export const CONTACT_EMAIL = 'contato@topsitebr.com.br'

// Mensagens de WhatsApp: todas pedem o diagnóstico grátis; o contexto (segmento, cidade, serviço) vai no fim
export const DEFAULT_WHATSAPP_MESSAGE = 'Olá! Quero o diagnóstico grátis para aparecer no Google e nas IAs.'

export function diagnosticMessage(context?: string) {
  return context ? DEFAULT_WHATSAPP_MESSAGE + ' ' + context : DEFAULT_WHATSAPP_MESSAGE
}

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
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TopSite — Seu site no Google e nas IAs' }],
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

