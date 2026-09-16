/** @type {import('next').NextConfig} */
const nextConfig = {
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
