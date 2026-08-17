import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function DescadastrarPage({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  const email = searchParams.email?.trim().toLowerCase() ?? ''
  let status: 'success' | 'already' | 'invalid' = 'invalid'

  if (email && email.includes('@')) {
    const existing = await prisma.emailOptOut.findUnique({ where: { email } })
    if (existing) {
      status = 'already'
    } else {
      await prisma.emailOptOut.create({ data: { email } })
      status = 'success'
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif" }}>
      <div style={{ maxWidth: 480, width: '100%' }}>
        {/* Header */}
        <div style={{ background: '#0a0a0a', borderRadius: '10px 10px 0 0', padding: '28px 32px', textAlign: 'center' }}>
          <div style={{ color: '#facc15', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>TOP SITE</div>
        </div>

        {/* Body */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '32px 36px', textAlign: 'center' }}>
          {status === 'success' && (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <h1 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 700, color: '#111827' }}>
                Descadastro confirmado
              </h1>
              <p style={{ margin: '0 0 24px', fontSize: 15, lineHeight: 1.75, color: '#374151' }}>
                O endereço <strong>{email}</strong> foi removido da nossa lista de e-mails de marketing. Você não receberá mais mensagens promocionais.
              </p>
            </>
          )}
          {status === 'already' && (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>ℹ️</div>
              <h1 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 700, color: '#111827' }}>
                Já descadastrado
              </h1>
              <p style={{ margin: '0 0 24px', fontSize: 15, lineHeight: 1.75, color: '#374151' }}>
                O endereço <strong>{email}</strong> já estava removido da nossa lista.
              </p>
            </>
          )}
          {status === 'invalid' && (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
              <h1 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 700, color: '#111827' }}>
                Link inválido
              </h1>
              <p style={{ margin: '0 0 24px', fontSize: 15, lineHeight: 1.75, color: '#374151' }}>
                O link de descadastro está incompleto. Use o link do rodapé do e-mail recebido.
              </p>
            </>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', margin: '0 0 20px' }} />
          <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', lineHeight: 1.8 }}>
            <Link href="/termos" style={{ color: '#9ca3af' }}>Termos de Uso</Link>
            &nbsp;·&nbsp;
            <Link href="/privacidade" style={{ color: '#9ca3af' }}>Política de Privacidade</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
