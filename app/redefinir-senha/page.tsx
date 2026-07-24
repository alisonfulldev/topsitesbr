import crypto from 'crypto'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { RedefinirSenhaForm } from './_components/RedefinirSenhaForm'

export const metadata = {
  title: 'Redefinir senha',
}

interface Props {
  searchParams: { token?: string }
}

export default async function RedefinirSenhaPage({ searchParams }: Props) {
  const token = searchParams.token

  // No token provided — redirect to forgot-password page
  if (!token) {
    redirect('/esqueci-senha')
  }

  // Validate the token
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { usedAt: true, expiresAt: true },
  })

  const isValid =
    resetToken !== null &&
    resetToken.usedAt === null &&
    resetToken.expiresAt > new Date()

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-dark px-4">
      <div className="w-full max-w-xs">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image
            src="/logo.png"
            alt="TOP SITE"
            width={200}
            height={68}
            className="h-16 w-auto"
            priority
          />
        </div>

        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-lg font-bold text-white mb-1">Redefinir senha</h1>
          {isValid && (
            <p className="text-sm text-zinc-500">
              Escolha uma nova senha para sua conta.
            </p>
          )}
        </div>

        {isValid ? (
          <RedefinirSenhaForm token={token} />
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-6 text-center">
            <div className="mb-3 text-2xl">⚠️</div>
            <p className="text-sm font-semibold text-white mb-2">
              Link inválido ou expirado
            </p>
            <p className="text-xs text-zinc-500 mb-5">
              Este link de redefinição é inválido ou já expirou. Solicite um novo
              link para continuar.
            </p>
            <Link
              href="/esqueci-senha"
              className="inline-block rounded-xl bg-brand px-6 py-3 text-sm font-bold text-black tracking-wide hover:bg-brand-hover transition-all"
            >
              Solicitar novo link
            </Link>
          </div>
        )}

        {/* Back to login */}
        {isValid && (
          <p className="mt-6 text-center text-sm text-zinc-600">
            <Link href="/login" className="hover:text-zinc-400 hover:underline transition-colors">
              Voltar para o login
            </Link>
          </p>
        )}
      </div>
    </main>
  )
}
