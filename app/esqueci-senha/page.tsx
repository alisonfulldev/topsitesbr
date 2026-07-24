import Image from 'next/image'
import Link from 'next/link'
import { EsqueciSenhaForm } from './_components/EsqueciSenhaForm'

export const metadata = {
  title: 'Esqueci minha senha',
}

export default function EsqueciSenhaPage() {
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
          <h1 className="text-lg font-bold text-white mb-1">Esqueci minha senha</h1>
          <p className="text-sm text-zinc-500">
            Informe seu e-mail e enviaremos as instruções para redefinir sua senha.
          </p>
        </div>

        <EsqueciSenhaForm />

        {/* Back to login */}
        <p className="mt-6 text-center text-sm text-zinc-600">
          <Link href="/login" className="hover:text-zinc-400 hover:underline transition-colors">
            Voltar para o login
          </Link>
        </p>
      </div>
    </main>
  )
}
