import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TOP SITE',
  description: 'Gerencie seu site, acompanhe o status e solicite manutenções',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/android-chrome-192x192.png',
    other: [
      { rel: 'android-chrome', url: '/icon.png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TOP SITE',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* PWA — iOS Safari */}
        <link rel="apple-touch-icon" href="/android-chrome-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TOP SITE" />
      </head>
      <body className={inter.className}>
        {/* Must be first — captures beforeinstallprompt before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__deferredInstallPrompt=e;document.dispatchEvent(new CustomEvent('pwainstallready'));});` }} />
        <Providers>{children}</Providers>
        {/* Own analytics tracker — set NEXT_PUBLIC_TRACK_SITE_ID to the site UUID for this domain */}
        {process.env.NEXT_PUBLIC_TRACK_SITE_ID && (
          <>
            <script dangerouslySetInnerHTML={{ __html: `window.__ts_id="${process.env.NEXT_PUBLIC_TRACK_SITE_ID}";` }} />
            <script defer src="/tracker.js" />
          </>
        )}
      </body>
    </html>
  )
}
