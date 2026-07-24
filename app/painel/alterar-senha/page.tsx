import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AlterarSenhaForm } from './_components/AlterarSenhaForm'

export default async function AlterarSenhaPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { mustChangePassword: true },
  })

  const mustChangePassword = user?.mustChangePassword ?? false

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        {mustChangePassword ? (
          <>
            <h2 className="text-xl font-semibold text-gray-900">Crie sua senha pessoal</h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Bem-vindo(a)! Como é seu primeiro acesso, você precisa criar uma senha pessoal
              antes de continuar.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-900">Alterar senha</h2>
            <p className="text-sm text-gray-500 mt-1">
              Escolha uma senha segura para proteger sua conta.
            </p>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <AlterarSenhaForm mustChangePassword={mustChangePassword} />
      </div>
    </div>
  )
}
