import type { MetadataRoute } from 'next'
import { marketingServices, SITE_URL } from '@/lib/marketing'
import { cities } from '@/lib/seo/cities'
import { niches } from '@/lib/seo/niches'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Páginas principais
    ...['', ...marketingServices.map(({ href }) => href), '/sobre', '/site-para'].map((path) => ({
      url: SITE_URL + path,
      lastModified: new Date('2026-09-20'),
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : 0.8,
    })),
    // Índices hub
    ...['/mapa-do-site'].map((path) => ({
      url: SITE_URL + path,
      lastModified: new Date('2026-09-20'),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
    // Hubs por cidade (/servicos/[cidade])
    ...cities.map((city) => ({
      url: SITE_URL + '/servicos/' + city.slug,
      lastModified: new Date('2026-09-20'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    // Páginas de cidade (/criacao-de-sites/[cidade])
    ...cities.map((city) => ({
      url: SITE_URL + '/criacao-de-sites/' + city.slug,
      lastModified: new Date('2026-09-20'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    // Páginas de nicho (/site-para/[nicho])
    ...niches.map((niche) => ({
      url: SITE_URL + '/site-para/' + niche.slug,
      lastModified: new Date('2026-09-20'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    // Páginas de combinação (/site-para/[nicho]/[cidade])
    ...niches.flatMap((niche) =>
      cities.map((city) => ({
        url: SITE_URL + '/site-para/' + niche.slug + '/' + city.slug,
        lastModified: new Date('2026-09-20'),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    ),
    ...['/termos', '/privacidade'].map((path) => ({
      url: SITE_URL + path,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    })),
  ]
}
