import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminGenerateReportsButton } from './_components/AdminGenerateReportsButton'

export default async function AdminRelatoriosPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <h1 className="text-xl font-bold text-gray-900 mb-2">Relatórios Semanais</h1>
      <p className="text-sm text-gray-500 mb-6">
        Gera e envia relatórios semanais de desempenho para todos os clientes com site online e analytics configurado.
        Use isto para disparar o primeiro lote imediatamente.
      </p>
      <AdminGenerateReportsButton />
    </div>
  )
}
