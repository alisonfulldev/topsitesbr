import Link from 'next/link'
import { getClients } from './actions'
import { buttonVariantClass } from '@/components/ui/button-class'
import { ClientesTableClient } from './_components/ClientesTableClient'

export default async function ClientesPage() {
  const clients = await getClients()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Clientes</h2>
          <p className="text-sm text-gray-500 mt-1">{clients.length} cadastros</p>
        </div>
        <Link href="/admin/clientes/novo" className={buttonVariantClass('primary', 'sm')}>
          + Novo Cliente
        </Link>
      </div>
      <ClientesTableClient clients={clients} />
    </div>
  )
}
