'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createSite } from '../actions'

const INPUT =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

export function SiteFormClient({ clientId }: { clientId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const fd = new FormData(formRef.current!)
    startTransition(async () => {
      const result = await createSite(fd)
      if (result?.error) {
        setError(result.error)
      } else {
        router.push(`/admin/clientes/${clientId}/sites`)
      }
    })
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg"
    >
      <input type="hidden" name="clientId" value={clientId} />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <Field label="Tipo de site" required>
          <select name="siteType" className={INPUT} defaultValue="mini_site">
            <option value="mini_site">Mini Site</option>
            <option value="landing_page">Landing Page</option>
            <option value="institucional">Institucional</option>
            <option value="loja_virtual">Loja Virtual</option>
          </select>
        </Field>

        <Field label="Status" required>
          <select name="status" className={INPUT} defaultValue="pendente_ativacao">
            <option value="pendente_ativacao">Pendente de Ativação</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="manutencao">Em Manutenção</option>
            <option value="suspenso">Suspenso</option>
          </select>
        </Field>

        <Field
          label="URL publicada"
          hint="Onde o site está no ar (GitHub Pages, Vercel, etc.) — preencha depois da publicação"
        >
          <input
            type="url"
            name="siteUrl"
            placeholder="https://exemplo.com"
            className={INPUT}
          />
        </Field>

        <Field
          label="Template usado"
          hint="Nome ou identificador do template visual utilizado"
        >
          <input
            type="text"
            name="templateUsed"
            placeholder="Ex: restaurante-v1, clinica-azul"
            className={INPUT}
          />
        </Field>

        <Field
          label="Arquivo ZIP do site"
          hint="ZIP com os arquivos HTML/CSS/JS — o cliente poderá baixar pelo painel"
        >
          <div className="flex items-center gap-3">
            <label className="flex-1 flex items-center gap-2 px-3 py-2 border border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <span className="text-gray-400 text-xs">
                {fileName ?? 'Clique para selecionar um arquivo .zip'}
              </span>
              <input
                type="file"
                name="filesZip"
                accept=".zip,application/zip,application/x-zip-compressed"
                className="hidden"
                onChange={(e) =>
                  setFileName(e.target.files?.[0]?.name ?? null)
                }
              />
            </label>
            {fileName && (
              <button
                type="button"
                onClick={() => {
                  setFileName(null)
                  if (formRef.current) {
                    const input = formRef.current.querySelector<HTMLInputElement>(
                      'input[name="filesZip"]'
                    )
                    if (input) input.value = ''
                  }
                }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </Field>

        <Field label="Observações">
          <textarea
            name="notes"
            rows={3}
            placeholder="Anotações internas sobre este site..."
            className={`${INPUT} resize-none`}
          />
        </Field>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Salvando...' : 'Cadastrar Site'}
        </button>
      </div>
    </form>
  )
}
