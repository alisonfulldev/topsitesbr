import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SiteFormClient } from '../_components/SiteFormClient'

export default async function NovoSitePage({
  params,
}: {
  params: { id: string }
}) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    select: { id: true, name: true },
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
        <Link
          href={`/admin/clientes/${client.id}/sites`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Sites
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium">Novo</span>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Novo Site</h2>
        <p className="text-sm text-gray-500 mt-1">
          Cadastro manual para <strong>{client.name}</strong> — preencha o que
          souber agora e atualize depois da publicação.
        </p>
      </div>

      <SiteFormClient clientId={client.id} />
    </div>
  )
}
