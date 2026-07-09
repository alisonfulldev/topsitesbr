import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SignOutButton } from '@/components/sign-out-button'

export default async function PainelPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">Meu Painel</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{session?.user.name}</span>
          <SignOutButton />
        </div>
      </header>
      <main className="p-6">
        <p className="text-gray-500 text-sm">Bem-vindo ao seu painel.</p>
      </main>
    </div>
  )
}
