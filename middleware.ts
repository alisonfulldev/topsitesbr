import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
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

    // Rotas /painel/* → somente role client
    if (pathname.startsWith('/painel') && token.role !== 'client') {
      return NextResponse.redirect(new URL('/admin', req.url))
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

export const config = {
  matcher: ['/admin/:path*', '/painel/:path*'],
}
