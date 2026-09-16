import type { MetadataRoute } from 'next'
import { marketingServices, SITE_URL } from '@/lib/marketing'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...['', ...marketingServices.map(({ href }) => href), '/portfolio'].map((path) => ({
      url: SITE_URL + path,
      lastModified: new Date('2026-09-16'),
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : 0.8,
    })),
    ...['/termos', '/privacidade'].map((path) => ({
      url: SITE_URL + path,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    })),
  ]
}
