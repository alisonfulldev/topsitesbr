/** @type {import('next').NextConfig} */
// Cabeçalhos básicos de segurança. A CSP é propositalmente mínima: só impede o
// site de ser embutido por terceiros (clickjacking), plugins e troca de <base>,
// sem restringir scripts — o Meta Pixel e os scripts inline do Next continuam.
// HSTS enviado aqui porque, fora da Vercel, ninguém mais o adiciona.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'" },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
]

const nextConfig = {
  // Gera .next/standalone (servidor Node enxuto) usado pelo Dockerfile da VPS
  output: 'standalone',
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  async redirects() {
    return [{ source: '/comprar', destination: '/criacao-de-sites', permanent: true }]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Upload da prévia em HTML nas propostas online (até 3 MB)
  experimental: {
    serverActions: { bodySizeLimit: '4mb' },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}

export default nextConfig
