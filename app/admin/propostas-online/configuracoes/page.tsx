import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getOnlineProposalConfig } from '@/lib/online-proposal/config'
import { ConfigForm } from '../_components/ConfigForm'

export const dynamic = 'force-dynamic'

export default async function OnlineProposalConfigPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')
  const config = await getOnlineProposalConfig()
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-1 text-sm text-gray-500">
        <Link href="/admin/propostas-online" className="hover:text-gray-800">Propostas online</Link><span>/</span><span>Configurações</span>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Sequência de e-mails</h2>
      <ConfigForm initial={config} />
    </div>
  )
}
