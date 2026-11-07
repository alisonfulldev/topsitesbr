import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getProspectingConfig } from '@/lib/prospecting/config'
import { ConfigForm } from './ConfigForm'

export const dynamic = 'force-dynamic'

export default async function ProspeccaoConfigPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')
  const config = await getProspectingConfig()

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/prospeccao" className="text-sm text-gray-500 hover:text-gray-800">← Prospecção</Link>
      <h2 className="mb-5 mt-2 text-xl font-semibold text-gray-900">Configurações da prospecção</h2>
      <ConfigForm initial={config} />
    </div>
  )
}
