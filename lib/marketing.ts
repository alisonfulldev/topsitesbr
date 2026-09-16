import type { Metadata } from 'next'

export const SITE_URL = 'https://topsitebr.com.br'
export const BRAND_DESCRIPTION = 'Sites profissionais, lojas virtuais e software sob medida para empresas. Conheça os serviços da TopSite e converse sobre seu projeto.'

export const marketingServices = [
  { href: '/criacao-de-sites', label: 'Criação de sites' },
  { href: '/site-institucional', label: 'Site institucional' },
  { href: '/landing-page', label: 'Landing pages' },
  { href: '/loja-virtual', label: 'Lojas virtuais' },
  { href: '/desenvolvimento-de-software', label: 'Software sob medida' },
]

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
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TopSite — Sites profissionais e software sob medida' }],
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

export const portfolioProjects = [
  { name: 'Estética Del Soares', segment: 'Clínica de estética', domain: 'esteticadelsoares.com.br', favicon: '/faicon/del.png', description: 'Presença digital para apresentar a clínica e seus tratamentos.' },
  { name: 'OZ Energia Solar', segment: 'Energia solar', domain: 'ozenergiasolar.com.br', favicon: '/faicon/oz.png', description: 'Site para apresentar soluções de energia solar e os canais de contato.' },
  { name: 'Yasmim Pinho Psicóloga', segment: 'Psicologia', domain: 'yasmimpinhopsicologa.com.br', favicon: '/faicon/yasmin.png', description: 'Apresentação profissional e informações sobre o atendimento psicológico.' },
]
