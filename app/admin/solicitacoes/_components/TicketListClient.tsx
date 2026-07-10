'use client'

import { useState, useTransition } from 'react'
import { updateTicketStatus } from '../actions'

type TicketRow = {
  id: string
  changeType: string
  textContent: string | null
  attachmentUrl: string | null
  status: string
  isExtraPaid: boolean
  isPriority: boolean
  createdAt: string
  clientName: string
  siteUrl: string | null
  siteType: string
  deadlineAt: string
}

const CHANGE_TYPE_LABEL: Record<string, string> = {
  correcao: 'Correção',
  texto: 'Alt. de Texto',
  imagem: 'Alt. de Imagem',
  texto_e_imagem: 'Texto + Imagem',
  nova_secao: 'Nova Seção',
  nova_pagina: 'Nova Página',
  duvida: 'Dúvida',
  outro: 'Outro',
}

const STATUS_LABEL: Record<string, string> = {
  open: 'Aberto',
  in_progress: 'Em andamento',
  done: 'Concluído',
}

const STATUS_COLOR: Record<string, string> = {
  open: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
}

const TYPE_COLOR: Record<string, string> = {
  correcao: 'bg-purple-100 text-purple-700',
  texto: 'bg-indigo-100 text-indigo-700',
  imagem: 'bg-pink-100 text-pink-700',
  texto_e_imagem: 'bg-violet-100 text-violet-700',
  nova_secao: 'bg-orange-100 text-orange-700',
  nova_pagina: 'bg-orange-100 text-orange-700',
  duvida: 'bg-gray-100 text-gray-700',
  outro: 'bg-gray-100 text-gray-700',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function deadlineState(deadlineIso: string): 'overdue' | 'soon' | 'ok' {
  const diff = new Date(deadlineIso).getTime() - Date.now()
  if (diff < 0) return 'overdue'
  if (diff < 24 * 60 * 60 * 1000) return 'soon'
  return 'ok'
}

const DEADLINE_STYLE: Record<string, string> = {
  overdue: 'text-red-600 font-semibold',
  soon: 'text-orange-500 font-semibold',
  ok: 'text-gray-500',
}

function TicketCard({
  ticket,
  onStatusChange,
}: {
  ticket: TicketRow
  onStatusChange: (id: string, status: string) => void
}) {
  const dl = deadlineState(ticket.deadlineAt)
  const isMock = ticket.attachmentUrl?.startsWith('/mock-uploads/')

  return (
    <div
      className={`bg-white rounded-xl border p-4 space-y-3 ${
        ticket.isPriority ? 'border-indigo-300' : 'border-gray-200'
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {ticket.isPriority && (
            <span className="text-[10px] font-bold uppercase tracking-wide bg-indigo-600 text-white px-1.5 py-0.5 rounded">
              Prioritário
            </span>
          )}
          {ticket.isExtraPaid && (
            <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
              Cobrado à parte
            </span>
          )}
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${TYPE_COLOR[ticket.changeType] ?? 'bg-gray-100 text-gray-600'}`}
          >
            {CHANGE_TYPE_LABEL[ticket.changeType] ?? ticket.changeType}
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_COLOR[ticket.status] ?? 'bg-gray-100 text-gray-600'}`}
          >
            {STATUS_LABEL[ticket.status] ?? ticket.status}
          </span>
        </div>
        <span className="text-xs text-gray-400">{formatDate(ticket.createdAt)}</span>
      </div>

      {/* Client + site */}
      <div className="text-sm">
        <span className="font-medium text-gray-900">{ticket.clientName}</span>
        {ticket.siteUrl ? (
          <a
            href={ticket.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-xs text-indigo-600 hover:underline"
          >
            {ticket.siteUrl}
          </a>
        ) : (
          <span className="ml-2 text-xs text-gray-400">{ticket.siteType}</span>
        )}
      </div>

      {/* Text content */}
      {ticket.textContent && (
        <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
          {ticket.textContent}
        </div>
      )}

      {/* Attachment */}
      {ticket.attachmentUrl && (
        <div>
          {isMock ? (
            <span className="text-xs text-gray-400 italic">
              📎 {ticket.attachmentUrl.split('/').pop()} (mock)
            </span>
          ) : (
            <a href={ticket.attachmentUrl} target="_blank" rel="noopener noreferrer">
              <img
                src={ticket.attachmentUrl}
                alt="Anexo"
                className="max-h-32 rounded-lg border border-gray-200 object-cover"
              />
            </a>
          )}
        </div>
      )}

      {/* Deadline */}
      <div className={`text-xs ${DEADLINE_STYLE[dl]}`}>
        Prazo:{' '}
        {dl === 'overdue'
          ? `VENCIDO em ${formatDate(ticket.deadlineAt)}`
          : dl === 'soon'
            ? `Vence HOJE (${formatDate(ticket.deadlineAt)})`
            : formatDate(ticket.deadlineAt)}
      </div>

      {/* Status actions */}
      {ticket.status !== 'done' && (
        <div className="flex gap-2 pt-1">
          {ticket.status === 'open' && (
            <button
              onClick={() => onStatusChange(ticket.id, 'in_progress')}
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Iniciar atendimento
            </button>
          )}
          {ticket.status === 'in_progress' && (
            <button
              onClick={() => onStatusChange(ticket.id, 'done')}
              className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Marcar como concluído
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function TicketListClient({ tickets: initial }: { tickets: TicketRow[] }) {
  const [tickets, setTickets] = useState(initial)
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'done'>('all')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleStatusChange(id: string, newStatus: string) {
    setError(null)
    // Optimistic update
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    )
    startTransition(async () => {
      const result = await updateTicketStatus(id, newStatus as 'open' | 'in_progress' | 'done')
      if (result.error) {
        setError(result.error)
        // Revert optimistic update
        setTickets(initial)
      }
    })
  }

  const filtered = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter)
  const counts = {
    open: tickets.filter((t) => t.status === 'open').length,
    in_progress: tickets.filter((t) => t.status === 'in_progress').length,
    done: tickets.filter((t) => t.status === 'done').length,
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 flex-wrap">
        {(
          [
            { key: 'all', label: 'Todos', count: tickets.length },
            { key: 'open', label: 'Abertos', count: counts.open },
            { key: 'in_progress', label: 'Em andamento', count: counts.in_progress },
            { key: 'done', label: 'Concluídos', count: counts.done },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            <span
              className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                filter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4">
          {error}
        </p>
      )}

      {isPending && (
        <p className="text-xs text-gray-400 mb-3">Atualizando…</p>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-400">
          Nenhuma solicitação{filter !== 'all' ? ` com status "${STATUS_LABEL[filter]}"` : ''}.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
