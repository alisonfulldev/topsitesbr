import Link from 'next/link'
import { getClients } from './actions'

export default async function ClientesPage() {
  const clients = await getClients()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Clientes</h2>
          <p className="text-sm text-gray-500 mt-1">{clients.length} cadastros</p>
        </div>
        <Link
          href="/admin/clientes/novo"
          className="px-3 py-1.5 bg-brand text-brand-dark text-sm rounded-md hover:bg-brand-hover transition-colors"
        >
          + Novo Cliente
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  'Nome',
                  'E-mail',
                  'Telefone',
                  'Sites',
                  'Plano',
                  'Código ref.',
                  'Cadastro',
                  'Ações',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clients.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    Nenhum cliente cadastrado ainda.
                  </td>
                </tr>
              )}
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.phone ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {c.sitesCount}
                  </td>
                  <td className="px-4 py-3">
                    {c.planName ? (
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-text">
                        {c.planName}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {c.referralCode}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/clientes/${c.id}`}
                        className="text-xs text-brand-text hover:text-brand-dark underline underline-offset-2"
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/admin/clientes/${c.id}/editar`}
                        className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
                      >
                        Editar
                      </Link>
                      <Link
                        href={`/admin/clientes/${c.id}/sites`}
                        className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
                      >
                        Sites
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
