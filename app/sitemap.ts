import type { MetadataRoute } from 'next'

const BASE = 'https://topsitebr.com.br'

export default function sitemap(): MetadataRoute.Sitemap {
  const marketingPages = [
    '', '/criacao-de-sites', '/site-institucional',
    '/landing-page', '/loja-virtual', '/portfolio',
  ]

  return [
    ...marketingPages.map((path) => ({
      url: `${BASE}${path}`,
      lastModified: new Date('2026-09-15'),
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : 0.8,
    })),
    ...['/termos', '/privacidade'].map((path) => ({
      url: `${BASE}${path}`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    })),
  ]
}
