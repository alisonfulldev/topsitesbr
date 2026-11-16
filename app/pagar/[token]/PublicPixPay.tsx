'use client'

import { useEffect, useState } from 'react'
import type { MonthlyPix } from '@/lib/monthly-plan-service'
import { checkPublicPixAction } from './actions'

export function PublicPixPay({ token, initialPix, amount, dueDate, overdue }: { token: string; initialPix: MonthlyPix; amount: string; dueDate: string | null; overdue: boolean }) {
  const [pix, setPix] = useState(initialPix)
  const [paid, setPaid] = useState(false)
  const [copied, setCopied] = useState(false)

  // Confere o pagamento a cada 6 s; se o Pix expirar, a consulta já traz um novo
  useEffect(() => {
    const timer = setInterval(async () => {
      const r = await checkPublicPixAction(token)
      if (r.paid) {
        setPaid(true)
        clearInterval(timer)
      } else if (r.pix) setPix(r.pix)
    }, 6000)
    return () => clearInterval(timer)
  }, [token])

  if (paid) {
    return (
      <div className="rounded-2xl border border-green-200 bg-white p-8 text-center">
        <p className="text-xl font-semibold text-gray-900">Pagamento confirmado ✓</p>
        <p className="mt-2 text-gray-600">Obrigado! As próximas mensalidades serão debitadas automaticamente, se você autorizou no banco.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
      <p className="text-sm text-gray-500">{overdue ? 'Mensalidade em atraso' : 'Mensalidade'}{dueDate ? ` · vencimento ${dueDate}` : ''}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{amount}</p>

      {pix.qrCodeImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`data:image/png;base64,${pix.qrCodeImage}`} alt="QR Code Pix da mensalidade" className="mx-auto mt-6 h-56 w-56 rounded-lg border border-gray-100" />
      )}

      {pix.qrCodePayload && (
        <div className="mt-6 text-left">
          <label htmlFor="pix-cc" className="mb-1.5 block text-xs font-medium text-gray-600">Pix copia e cola</label>
          <textarea id="pix-cc" readOnly rows={3} value={pix.qrCodePayload} onFocus={(e) => e.currentTarget.select()} className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-xs text-gray-700 break-all" />
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(pix.qrCodePayload ?? '').then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })}
            className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white hover:bg-gray-700"
          >
            {copied ? 'Código copiado!' : 'Copiar código Pix'}
          </button>
        </div>
      )}

      <p className="mt-5 flex items-center justify-center gap-2 text-sm text-gray-500" role="status">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400" aria-hidden="true" />
        Aguardando o pagamento — a confirmação aparece aqui.
      </p>
      <p className="mt-2 text-xs text-gray-400">Ao pagar, seu banco pode pedir para autorizar o débito automático das próximas mensalidades.</p>
    </div>
  )
}
