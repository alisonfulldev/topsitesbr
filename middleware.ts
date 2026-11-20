import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware'
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server'

// Crawlers de IA / SEO bloqueados em todo o site (antes ficava no vercel.json,
// que só vale na Vercel).
const BLOCKED_BOTS =
  /(GPTBot|ClaudeBot|anthropic-ai|CCBot|Bytespider|meta-externalagent|Amazonbot|cohere-ai|Diffbot|ImagesiftBot|Timpibot|omgili|img2dataset|PanguBot|AhrefsBot|SemrushBot|MJ12bot|DotBot|BLEXBot|DataForSeoBot|Barkrowler|serpstatbot|SeekportBot|MegaIndex|PetalBot|YandexBot|YandexImages|Baiduspider|Sogou|360Spider|Yeti\/|SeznamBot|coccocbot)/i

const authMiddleware = withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Usuário inativo — desloga e manda pro login
    if (!token?.active) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'inactive')
      return NextResponse.redirect(url)
    }

    // Rotas /admin/* → somente role admin
    if (pathname.startsWith('/admin') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/painel', req.url))
    }

    // Rotas /painel/* → somente role client (ou admin em modo impersonação)
    if (pathname.startsWith('/painel') && token.role !== 'client') {
      const hasImpCookie = !!req.cookies.get('imp_id')?.value
      if (token.role !== 'admin' || !hasImpCookie) {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
    }

    // Usuário com senha temporária — força troca antes de continuar
    if (
      token.mustChangePassword &&
      pathname.startsWith('/painel') &&
      pathname !== '/painel/alterar-senha'
    ) {
      return NextResponse.redirect(new URL('/painel/alterar-senha', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // authorized retornando false redireciona para pages.signIn (/login)
      authorized({ token }) {
        return !!token
      },
    },
  }
)

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (BLOCKED_BOTS.test(req.headers.get('user-agent') ?? '')) {
    return new NextResponse(null, { status: 403 })
  }

  const { pathname } = req.nextUrl
  if (pathname.startsWith('/admin') || pathname.startsWith('/painel')) {
    return authMiddleware(req as NextRequestWithAuth, event)
  }

  return NextResponse.next()
}

export const config = {
  // Tudo, exceto assets estáticos do Next (o bloqueio de bots vale para o site inteiro)
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
