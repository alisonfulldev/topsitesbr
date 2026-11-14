'use client'

import { useState, useTransition } from 'react'
import { setPixMigrationAction } from '../pix-migration-actions'

export function PixMigrationCard({ enabled, remaining, migrated }: { enabled: boolean; remaining: number; migrated: number }) {
  const [msg, setMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  function toggle() {
    const next = !enabled
    const confirmText = next
      ? `Ligar a migração automática? A cada dia, as assinaturas antigas com mensalidade nos próximos 5 dias (${remaining} restante(s) no total) passam para o Pix Automático.`
      : 'Desligar a migração automática? Quem já migrou continua no Pix Automático.'
    if (!window.confirm(confirmText)) return
    startTransition(async () => {
      const r = await setPixMigrationAction(next)
      setMsg(r.error ? `Erro: ${r.error}` : '')
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-900">
          Migração para Pix Automático:{' '}
          <span className={enabled ? 'text-green-700' : 'text-gray-500'}>{enabled ? 'ligada' : 'desligada'}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {remaining} assinatura(s) antiga(s) a migrar · {migrated} já no Pix Automático ou no fluxo novo. A migração acontece
          5 dias antes da próxima mensalidade; quem está em atraso ou já pagou o ciclo migra no seguinte. Para testar com um
          cliente antes, use “Migrar para Pix Automático agora” na página dele.
        </p>
        {msg && <p className="text-xs text-red-700 mt-1">{msg}</p>}
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        className={`shrink-0 px-4 py-2 text-sm rounded-lg disabled:opacity-50 ${enabled ? 'border border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-gray-900 text-white hover:bg-gray-700'}`}
      >
        {enabled ? 'Desligar' : 'Ligar migração automática'}
      </button>
    </div>
  )
}
