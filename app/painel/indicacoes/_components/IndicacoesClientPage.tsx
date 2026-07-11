'use client'

import { useState } from 'react'

type Referral = {
  id: string
  referredName: string
  status: 'confirmado' | 'recompensado'
  createdAt: string
}

export function IndicacoesClientPage({
  referralCode,
  referralLink,
  referrals,
}: {
  referralCode: string
  referralLink: string
  referrals: Referral[]
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Seu link de indicação</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Compartilhe e ganhe 1 mês grátis quando seu indicado ativar o plano.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 truncate rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-700">
            {referralLink}
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-hover"
          >
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Código:{' '}
          <span className="font-mono font-semibold text-gray-600">{referralCode}</span>
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900">Indicações feitas</h3>
        </div>
        {referrals.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-500">
              Nenhuma indicação ainda. Compartilhe seu link e comece a ganhar!
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Indicado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {referrals.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-3 font-medium text-gray-900">{r.referredName}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-3">
                    {r.status === 'recompensado' ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Recompensada
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                        Confirmada
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
