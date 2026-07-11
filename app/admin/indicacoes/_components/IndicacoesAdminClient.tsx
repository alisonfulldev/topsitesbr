'use client'

import { useState, useTransition } from 'react'
import { marcarRecompensado } from '../actions'

type ReferralRow = {
  id: string
  referrerName: string
  referrerEmail: string
  referredName: string
  referredEmail: string
  status: 'confirmado' | 'recompensado'
  createdAt: string
  rewardedAt: string | null
}

export function IndicacoesAdminClient({ referrals }: { referrals: ReferralRow[] }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleRecompensar(id: string) {
    setError(null)
    startTransition(async () => {
      const result = await marcarRecompensado(id)
      if (result.error) setError(result.error)
    })
  }

  if (referrals.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">Nenhuma indicação registrada ainda.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Indicador</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Indicado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Data</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {referrals.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{r.referrerName}</p>
                  <p className="text-xs text-gray-400">{r.referrerEmail}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{r.referredName}</p>
                  <p className="text-xs text-gray-400">{r.referredEmail}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3">
                  {r.status === 'recompensado' ? (
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Recompensado
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                      Confirmado
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {r.status === 'confirmado' ? (
                    <button
                      onClick={() => handleRecompensar(r.id)}
                      disabled={pending}
                      className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-brand-dark transition-colors hover:bg-brand-hover disabled:opacity-50"
                    >
                      Marcar como recompensado
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">
                      {r.rewardedAt
                        ? new Date(r.rewardedAt).toLocaleDateString('pt-BR')
                        : '—'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
