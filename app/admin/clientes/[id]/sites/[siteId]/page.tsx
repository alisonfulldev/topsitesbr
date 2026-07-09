import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SiteDetailClient } from './_components/SiteDetailClient'

export default async function SiteDetailPage({
  params,
}: {
  params: { id: string; siteId: string }
}) {
  const site = await prisma.site.findUnique({
    where: { id: params.siteId, clientId: params.id },
    include: {
      client: { select: { id: true, name: true } },
      domains: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!site) notFound()

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Link
          href="/admin/clientes"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Clientes
        </Link>
        <span className="text-gray-300">/</span>
        <Link
          href={`/admin/clientes/${site.client.id}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {site.client.name}
        </Link>
        <span className="text-gray-300">/</span>
        <Link
          href={`/admin/clientes/${site.client.id}/sites`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Sites
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium truncate max-w-xs">
          {site.siteUrl ?? 'Site sem URL'}
        </span>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {site.siteUrl ?? 'Site sem URL publicada'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Cadastrado em {site.createdAt.toLocaleDateString('pt-BR')} ·{' '}
          {site.publishedAt
            ? `Publicado em ${site.publishedAt.toLocaleDateString('pt-BR')}`
            : 'Ainda não publicado'}
        </p>
      </div>

      <SiteDetailClient
        site={{
          id: site.id,
          clientId: site.clientId,
          siteUrl: site.siteUrl,
          siteType: site.siteType,
          templateUsed: site.templateUsed,
          status: site.status,
          filesZipUrl: site.filesZipUrl,
          notes: site.notes,
          domains: site.domains.map((d) => ({
            id: d.id,
            domain: d.domain,
            dnsStatus: d.dnsStatus as 'pendente' | 'verificado' | 'falhou',
            sslStatus: d.sslStatus as 'pendente' | 'ativo' | 'falhou',
            verifiedAt: d.verifiedAt?.toISOString() ?? null,
          })),
        }}
      />
    </div>
  )
}
