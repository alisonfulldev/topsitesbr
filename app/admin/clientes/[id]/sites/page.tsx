import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

const STATUS_LABEL: Record<string, string> = {
  pendente_ativacao: 'Pendente de Ativação',
  online: 'Online',
  offline: 'Offline',
  manutencao: 'Em Manutenção',
  suspenso: 'Suspenso',
}

const STATUS_COLOR: Record<string, string> = {
  pendente_ativacao: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  online: 'bg-green-100 text-green-700 border border-green-200',
  offline: 'bg-gray-100 text-gray-500 border border-gray-200',
  manutencao: 'bg-blue-100 text-blue-700 border border-blue-200',
  suspenso: 'bg-red-100 text-red-700 border border-red-200',
}

const TYPE_LABEL: Record<string, string> = {
  mini_site: 'Mini Site',
  landing_page: 'Landing Page',
  institucional: 'Institucional',
  loja_virtual: 'Loja Virtual',
}

export default async function SitesPage({
  params,
}: {
  params: { id: string }
}) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    select: { id: true, name: true },
  })

  if (!client) notFound()

  const sites = await prisma.site.findMany({
    where: { clientId: params.id },
    include: {
      domains: {
        select: {
          id: true,
          domain: true,
          dnsStatus: true,
          sslStatus: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

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
        <span className="text-sm text-gray-900 font-medium">Sites</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Sites de {client.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {sites.length} {sites.length === 1 ? 'site' : 'sites'} cadastrado
            {sites.length === 1 ? '' : 's'}
          </p>
        </div>
        <Link
          href={`/admin/clientes/${client.id}/sites/novo`}
          className="px-3 py-1.5 bg-brand text-brand-dark text-sm rounded-md hover:bg-brand-hover transition-colors"
        >
          + Novo Site
        </Link>
      </div>

      {sites.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-400 text-sm">Nenhum site cadastrado.</p>
          <Link
            href={`/admin/clientes/${client.id}/sites/novo`}
            className="mt-3 inline-block text-sm text-brand-text hover:underline"
          >
            Cadastrar primeiro site →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sites.map((site) => (
            <div
              key={site.id}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        STATUS_COLOR[site.status] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {STATUS_LABEL[site.status] ?? site.status}
                    </span>
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      {TYPE_LABEL[site.siteType] ?? site.siteType}
                    </span>
                    {site.templateUsed && (
                      <span className="text-xs text-gray-400">
                        Template: {site.templateUsed}
                      </span>
                    )}
                  </div>

                  <div className="mt-2">
                    {site.siteUrl ? (
                      <a
                        href={site.siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-text hover:underline break-all"
                      >
                        {site.siteUrl}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">
                        URL não definida
                      </span>
                    )}
                  </div>

                  {site.filesZipUrl && (
                    <div className="mt-1">
                      <a
                        href={site.filesZipUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                      >
                        ↓ Arquivo ZIP disponível
                      </a>
                    </div>
                  )}

                  {/* Domains */}
                  {site.domains.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {site.domains.map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs"
                        >
                          <span className="font-medium text-gray-700">
                            {d.domain}
                          </span>
                          <DnsIndicator status={d.dnsStatus} />
                          <SslIndicator status={d.sslStatus} />
                        </div>
                      ))}
                    </div>
                  )}

                  {site.notes && (
                    <p className="mt-2 text-xs text-gray-400 italic">
                      {site.notes}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Link
                    href={`/admin/clientes/${client.id}/sites/${site.id}`}
                    className="text-xs text-brand-text hover:text-brand-dark underline underline-offset-2"
                  >
                    Gerenciar →
                  </Link>
                  <span className="text-xs text-gray-400">
                    {site.createdAt.toLocaleDateString('pt-BR')}
                  </span>
                  {site.publishedAt && (
                    <span className="text-xs text-green-600">
                      Publicado em{' '}
                      {site.publishedAt.toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DnsIndicator({ status }: { status: string }) {
  const color =
    status === 'verificado'
      ? 'text-green-500'
      : status === 'falhou'
      ? 'text-red-500'
      : 'text-yellow-500'
  const label =
    status === 'verificado'
      ? 'DNS ✓'
      : status === 'falhou'
      ? 'DNS ✗'
      : 'DNS ⋯'
  return <span className={`text-xs ${color}`}>{label}</span>
}

function SslIndicator({ status }: { status: string }) {
  const color =
    status === 'ativo'
      ? 'text-green-500'
      : status === 'falhou'
      ? 'text-red-500'
      : 'text-yellow-500'
  const label =
    status === 'ativo' ? 'SSL ✓' : status === 'falhou' ? 'SSL ✗' : 'SSL ⋯'
  return <span className={`text-xs ${color}`}>{label}</span>
}
