'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createPresentationProposalAction } from '../actions'

export function CreateProposalForm() {
  const [link, setLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await createPresentationProposalAction(new FormData(e.currentTarget))
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setLink(result.link!)
    }
  }

  async function handleCopy() {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (link) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Proposta criada!</p>
            <p className="text-sm text-gray-500">Copie o link e envie pelo WhatsApp.</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Link da proposta
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={link}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 font-mono"
            />
            <button
              onClick={handleCopy}
              className="shrink-0 bg-brand text-brand-dark font-bold text-sm px-4 py-2.5 rounded-lg hover:bg-brand-hover transition-colors"
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => { setLink(null); setCopied(false) }}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Criar outra
          </button>
          <Link
            href="/admin/propostas-lp"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Ver todas as propostas
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Nome do cliente / empresa <span className="text-red-500">*</span>
        </label>
        <input
          name="clientName"
          type="text"
          required
          placeholder="Ex: João Silva / Clínica Bem Estar"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Valor da proposta (R$) <span className="text-red-500">*</span>
        </label>
        <input
          name="value"
          type="text"
          required
          placeholder="Ex: 1500,00"
          inputMode="decimal"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Descrição / Escopo do projeto <span className="text-red-500">*</span>
        </label>
        <textarea
          name="scope"
          required
          rows={6}
          placeholder="Descreva o que está incluso no projeto — o cliente verá este texto na proposta."
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors resize-y"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Detalhes adicionais{' '}
          <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          name="details"
          rows={4}
          placeholder="Observações, prazos, condições especiais, etc."
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors resize-y"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Modo da proposta</label>
        <div className="flex flex-col gap-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="radio" name="mode" value="apresentacao" defaultChecked className="mt-0.5" />
            <div>
              <span className="text-sm font-medium text-gray-900">Apresentação</span>
              <p className="text-xs text-gray-400">Cliente vê a proposta e vai para o WhatsApp para fechar.</p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="radio" name="mode" value="completa" className="mt-0.5" />
            <div>
              <span className="text-sm font-medium text-gray-900">Completa (checkout)</span>
              <p className="text-xs text-gray-400">Cliente assina contrato, cria senha e paga direto pela plataforma.</p>
            </div>
          </label>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="bg-brand text-brand-dark font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-60"
        >
          {loading ? 'Criando...' : 'Gerar Link da Proposta'}
        </button>
        <Link href="/admin/propostas-lp" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
