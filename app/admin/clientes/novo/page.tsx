import Link from 'next/link'
import { getRecentReferralCodes } from '../actions'
import { ClientForm } from '../_components/ClientForm'

export default async function NovoClientePage() {
  const recentCodes = await getRecentReferralCodes()

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/admin/clientes"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Clientes
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium">Novo Cliente</span>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Novo Cliente</h2>
        <p className="text-sm text-gray-500 mt-1">
          Cadastre um novo cliente no painel
        </p>
      </div>

      <ClientForm mode="create" recentCodes={recentCodes} />
    </div>
  )
}
