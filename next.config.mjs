/** @type {import('next').NextConfig} */
// Cabeçalhos básicos de segurança. A CSP é propositalmente mínima: só impede o
// site de ser embutido por terceiros (clickjacking), plugins e troca de <base>,
// sem restringir scripts — o Meta Pixel e os scripts inline do Next continuam.
// HSTS já é enviado pela Vercel.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'" },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
]

const nextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  async redirects() {
    return [{ source: '/comprar', destination: '/criacao-de-sites', permanent: true }]
  },
  eslint: {
    ignoreDuringBuilds: true,
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
