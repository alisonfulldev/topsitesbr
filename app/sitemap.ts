import type { MetadataRoute } from 'next'

const BASE = 'https://topsitebr.com.br'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE,
      lastModified: new Date('2026-09-05'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE}/termos`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE}/privacidade`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]
}
