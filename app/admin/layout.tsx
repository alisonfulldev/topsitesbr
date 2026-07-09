import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@/components/sign-out-button'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
            TopSites
          </p>
          <h1 className="text-sm font-semibold text-gray-900 mt-0.5">Painel Admin</h1>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 text-sm">
          <Link
            href="/admin"
            className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/clientes"
            className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Clientes
          </Link>
          <Link
            href="/admin/usuarios"
            className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Usuários
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <p className="text-xs text-gray-500 truncate">{session.user.name}</p>
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  )
}
