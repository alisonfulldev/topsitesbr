import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ContaForm } from '@/app/conta/_components/ContaForm'

export default async function PainelContaPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) redirect('/login')
  if (session.user.role !== 'client') redirect('/admin/conta')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      role: true,
      lastLoginAt: true,
      mustChangePassword: true,
    },
  })

  if (!user) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Minha Conta</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie suas informações de acesso.</p>
      </div>

      <ContaForm
        user={{
          name: user.name,
          email: user.email,
          role: user.role,
          lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
          mustChangePassword: user.mustChangePassword,
        }}
      />
    </div>
  )
}
