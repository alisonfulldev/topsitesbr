import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin', '/painel', '/api/', '/login', '/dev/',
        '/modelos/', '/proposta/', '/p/', '/i/', '/orcamento/',
        '/briefing/obrigado', '/redefinir-senha', '/esqueci-senha',
      ],
    }],
    sitemap: 'https://topsitebr.com.br/sitemap.xml',
  }
}
