import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ClientForm } from '../../_components/ClientForm'

export default async function EditarClientePage({
  params,
}: {
  params: { id: string }
}) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      document: true,
      siteEntryFee: true,
    },
  })

  if (!client) notFound()

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
        <Link
          href={`/admin/clientes/${client.id}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {client.name}
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium">Editar</span>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Editar Cliente</h2>
        <p className="text-sm text-gray-500 mt-1">{client.name}</p>
      </div>

      <ClientForm
        mode="edit"
        clientId={client.id}
        initialData={{
          name: client.name,
          email: client.email,
          phone: client.phone ?? '',
          document: client.document ?? '',
          siteEntryFee: client.siteEntryFee != null ? Number(client.siteEntryFee) : null,
        }}
      />
    </div>
  )
}
