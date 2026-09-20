import type { MetadataRoute } from 'next'
import { marketingServices, SITE_URL } from '@/lib/marketing'
import { cities } from '@/lib/seo/cities'
import { niches } from '@/lib/seo/niches'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...['', ...marketingServices.map(({ href }) => href), '/sobre', '/portfolio'].map((path) => ({
      url: SITE_URL + path,
      lastModified: new Date('2026-09-20'),
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : 0.8,
    })),
    ...cities.map((city) => ({
      url: SITE_URL + '/criacao-de-sites/' + city.slug,
      lastModified: new Date('2026-09-20'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...niches.map((niche) => ({
      url: SITE_URL + '/site-para/' + niche.slug,
      lastModified: new Date('2026-09-20'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...['/termos', '/privacidade'].map((path) => ({
      url: SITE_URL + path,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    })),
  ]
}
