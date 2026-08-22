import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/painel', '/admin', '/api', '/login'],
      },
    ],
    sitemap: 'https://topsitebr.com.br/sitemap.xml',
  }
}
