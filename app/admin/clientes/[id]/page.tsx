import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

const STATUS_LABEL: Record<string, string> = {
  pendente_ativacao: 'Pendente',
  online: 'Online',
  offline: 'Offline',
  manutencao: 'Manutenção',
  suspenso: 'Suspenso',
}

const STATUS_COLOR: Record<string, string> = {
  pendente_ativacao: 'bg-yellow-100 text-yellow-700',
  online: 'bg-green-100 text-green-700',
  offline: 'bg-gray-100 text-gray-600',
  manutencao: 'bg-blue-100 text-blue-700',
  suspenso: 'bg-red-100 text-red-700',
}

export default async function ClientePage({
  params,
}: {
  params: { id: string }
}) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          lastLoginAt: true,
        },
      },
      sites: {
        select: { id: true, siteUrl: true, siteType: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      },
      subscriptions: {
        include: { plan: { select: { name: true, price: true } } },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      referralsGiven: {
        include: { referredClient: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      referralReceived: {
        include: { referrerClient: { select: { id: true, name: true } } },
      },
    },
  })

  if (!client) notFound()

  const subscription = client.subscriptions[0]

  function Row({ label, value }: { label: string; value: ReactNode }) {
    return (
      <div className="flex gap-4 py-2.5 border-b border-gray-100 last:border-0">
        <dt className="w-36 shrink-0 text-sm text-gray-500">{label}</dt>
        <dd className="flex-1 text-sm text-gray-900">{value}</dd>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/admin/clientes"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Clientes
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium">{client.name}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{client.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Cadastrado em {client.createdAt.toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/clientes/${client.id}/editar`}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Editar
          </Link>
          <Link
            href={`/admin/clientes/${client.id}/assinatura`}
            className="px-3 py-1.5 text-sm border border-brand-200 rounded-lg text-brand-text hover:bg-brand-50"
          >
            Assinatura
          </Link>
          <Link
            href={`/admin/clientes/${client.id}/sites`}
            className="px-3 py-1.5 text-sm bg-brand text-brand-dark rounded-lg hover:bg-brand-hover"
          >
            Ver Sites
          </Link>
        </div>
      </div>

      {/* Dados do cliente */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Dados do Cliente</h3>
        <dl>
          <Row label="Nome" value={client.name} />
          <Row label="E-mail" value={client.email} />
          <Row label="Telefone" value={client.phone ?? <span className="text-gray-300">—</span>} />
          <Row
            label="CPF/CNPJ"
            value={client.document ?? <span className="text-gray-300">—</span>}
          />
          <Row
            label="Código de ref."
            value={
              <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-brand-text">
                {client.referralCode}
              </code>
            }
          />
          {'termsAcceptedAt' in client && client.termsAcceptedAt ? (
            <Row
              label="Termos aceitos"
              value={
                <span className="text-green-700">
                  {(client.termsAcceptedAt as Date).toLocaleDateString('pt-BR')}{' '}
                  {('termsVersion' in client && client.termsVersion)
                    ? <span className="text-gray-400 text-xs">(v{client.termsVersion as string})</span>
                    : null}
                </span>
              }
            />
          ) : null}
          <Row
            label="Plano"
            value={
              subscription ? (
                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-text">
                  {subscription.plan.name} — R${' '}
                  {Number(subscription.plan.price).toFixed(2).replace('.', ',')}
                  /mês
                </span>
              ) : (
                <span className="text-gray-300">Sem assinatura</span>
              )
            }
          />
        </dl>
      </div>

      {/* Logins */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Logins de Acesso</h3>
          <Link
            href="/admin/usuarios"
            className="text-xs text-brand-text hover:underline"
          >
            Gerenciar →
          </Link>
        </div>
        {client.users.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum login criado.</p>
        ) : (
          <div className="space-y-2">
            {client.users.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 text-sm"
              >
                <span className="font-medium text-gray-900">{u.name}</span>
                <span className="text-gray-400">{u.email}</span>
                <span
                  className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ml-auto ${
                    u.active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {u.active ? 'Ativo' : 'Inativo'}
                </span>
                {u.lastLoginAt && (
                  <span className="text-xs text-gray-400">
                    Último acesso:{' '}
                    {u.lastLoginAt.toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sites */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Sites ({client.sites.length})
          </h3>
          <Link
            href={`/admin/clientes/${client.id}/sites`}
            className="text-xs text-brand-text hover:underline"
          >
            Ver todos →
          </Link>
        </div>
        {client.sites.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum site cadastrado.</p>
        ) : (
          <div className="space-y-2">
            {client.sites.map((s) => (
              <div key={s.id} className="flex items-center gap-3 text-sm">
                <Link
                  href={`/admin/clientes/${client.id}/sites/${s.id}`}
                  className="font-medium text-brand-text hover:underline"
                >
                  {s.siteUrl ?? '(sem URL)'}
                </Link>
                <span className="text-gray-400 text-xs">{s.siteType}</span>
                <span
                  className={`ml-auto inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                    STATUS_COLOR[s.status] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {STATUS_LABEL[s.status] ?? s.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Indicações */}
      {(client.referralReceived || client.referralsGiven.length > 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Indicações</h3>

          {client.referralReceived && (
            <div className="text-sm text-gray-600 mb-3">
              <span className="font-medium">Foi indicado por: </span>
              <Link
                href={`/admin/clientes/${client.referralReceived.referrerClient.id}`}
                className="text-brand-text hover:underline"
              >
                {client.referralReceived.referrerClient.name}
              </Link>
              <span
                className={`ml-2 inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${
                  client.referralReceived.status === 'recompensado'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {client.referralReceived.status}
              </span>
            </div>
          )}

          {client.referralsGiven.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">
                Indicou {client.referralsGiven.length} cliente(s):
              </p>
              <div className="space-y-1.5">
                {client.referralsGiven.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 text-sm">
                    <Link
                      href={`/admin/clientes/${r.referredClient.id}`}
                      className="text-brand-text hover:underline"
                    >
                      {r.referredClient.name}
                    </Link>
                    <span
                      className={`ml-auto inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${
                        r.status === 'recompensado'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
