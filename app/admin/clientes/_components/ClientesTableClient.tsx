'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'

type ClientRow = {
  id: string
  name: string
  email: string
  phone: string | null
  sitesCount: number
  planName: string | null
  referralCode: string
  createdAt: string
}

export function ClientesTableClient({ clients }: { clients: ClientRow[] }) {
  const [search, setSearch] = useState('')

  const filtered = search
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase()) ||
          (c.phone ?? '').includes(search),
      )
    : clients

  return (
    <div>
      <div className="relative mb-4 max-w-xs">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Buscar por nome, e-mail ou telefone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Nome', 'E-mail', 'Telefone', 'Sites', 'Plano', 'Código ref.', 'Cadastro', 'Ações'].map((h) => (
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      title={
                        search
                          ? `Nenhum cliente para "${search}".`
                          : 'Nenhum cliente cadastrado ainda.'
                      }
                      className="py-10"
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.email}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {c.phone ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{c.sitesCount}</td>
                    <td className="px-4 py-3">
                      {c.planName ? (
                        <Badge variant="brand">{c.planName}</Badge>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
