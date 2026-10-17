import type { Metadata } from 'next'

export const SITE_URL = 'https://topsitebr.com.br'
export const BRAND_DESCRIPTION = 'Site profissional por apenas R$ 165: site institucional one page com serviços, fotos, contatos e botão de WhatsApp, adaptado ao celular.'

export const marketingServices = [
  { href: '/criacao-de-sites', label: 'Criação de sites' },
  { href: '/site-institucional', label: 'Site institucional' },
  { href: '/landing-page', label: 'Landing pages' },
  { href: '/loja-virtual', label: 'Lojas virtuais' },
]

// Oferta principal do site de divulgação — o preço é o grande diferencial
export const offer = {
  price: 'R$ 165',
  product: 'Site institucional one page',
  deliverables: [
    { title: 'Site institucional one page', text: 'Sua empresa, seus serviços, fotos e contatos reunidos em uma página profissional.' },
    { title: 'Adaptado ao celular', text: 'Fica bonito e fácil de usar no celular, no tablet e no computador.' },
    { title: 'Botão de WhatsApp em destaque', text: 'Quem visita seu site fala com você em um clique.' },
  ],
  optional: {
    price: 'R$ 29/mês',
    title: 'Hospedagem e manutenção mensal',
    text: 'Opcional: deixamos seu site no ar e cuidamos dos ajustes necessários.',
  },
}

export const offerPriceAnswer = 'O site institucional one page sai por apenas R$ 165. Ele reúne em uma página a apresentação da sua empresa, seus serviços, fotos, contatos e botão de WhatsApp, adaptado ao celular. Hospedagem e manutenção são opcionais, por R$ 29/mês.'

export const DEFAULT_WHATSAPP_MESSAGE = 'Olá! Quero meu site por R$ 165.'

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
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TopSite — Site profissional por R$ 165' }],
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
  email: 'contato@topsitebr.com.br',
  areaServed: { '@type': 'Country', name: 'Brazil' },
  contactPoint: {
    '@type': 'ContactPoint', contactType: 'customer service',
    telephone: '+55-18-99674-2364', availableLanguage: 'Portuguese',
  },
}

