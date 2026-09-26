import type { Metadata } from 'next'

export const SITE_URL = 'https://topsitebr.com.br'
export const BRAND_DESCRIPTION = 'Criamos sites que fazem empresas serem encontradas por clientes reais. Se você chegou até aqui pela internet, já está vivendo nosso método.'

export const marketingServices = [
  { href: '/criacao-de-sites', label: 'Criação de sites' },
  { href: '/site-institucional', label: 'Site institucional' },
  { href: '/landing-page', label: 'Landing pages' },
  { href: '/loja-virtual', label: 'Lojas virtuais' },
]

// Oferta única exibida no site de divulgação
export const offer = {
  price: 'R$ 497',
  installments: 'em até 12x no cartão',
  deliverables: [
    { title: 'Site completo com técnicas avançadas de posicionamento', text: 'Construído para atrair clientes que já buscam o que você vende — e não só existir na internet.' },
    { title: 'Google Meu Negócio completo', text: 'Perfil criado ou otimizado do zero para sua empresa aparecer no Google Maps e nas buscas locais.' },
  ],
  optional: {
    price: 'R$ 29/mês',
    title: 'Hospedagem, manutenção e relatório mensal',
    text: 'Opcional: deixamos seu site no ar, cuidamos dos ajustes e enviamos todo mês um relatório de visitas.',
  },
}

export const offerPriceAnswer = 'O site completo com técnicas avançadas de posicionamento + Google Meu Negócio completo sai por R$ 497, em até 12x no cartão. Hospedagem, manutenção e relatório mensal são opcionais, por R$ 29/mês.'

export function projectContact(message = 'Olá! Quero conversar sobre um projeto com a TopSite.') {
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
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TopSite — Sites que fazem empresas serem encontradas' }],
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

