'use client'

import { useState, useTransition } from 'react'
import { updateTicketStatus } from '../actions'
import { Card } from '@/components/ui/card'
import {
  Badge,
  TICKET_STATUS_VARIANT,
  TICKET_STATUS_LABEL,
  CHANGE_TYPE_VARIANT,
  CHANGE_TYPE_LABEL,
} from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Modal } from '@/components/ui/modal'

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
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
  onImageClick,
}: {
  ticket: TicketRow
  onStatusChange: (id: string, status: string) => void
  onImageClick: (url: string) => void
}) {
  const dl = deadlineState(ticket.deadlineAt)
  const isMock = ticket.attachmentUrl?.startsWith('/mock-uploads/')

  return (
    <Card className={ticket.isPriority ? 'border-brand-200' : ''} padding="sm">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {ticket.isPriority && (
            <Badge
              variant="brand"
              className="!bg-brand !text-brand-dark font-bold uppercase tracking-wide text-[10px]"
            >
              Prioritário
            </Badge>
          )}
          {ticket.isExtraPaid && (
            <Badge variant="warning" className="text-[10px] uppercase tracking-wide font-bold">
              Cobrado à parte
            </Badge>
          )}
          <Badge variant={CHANGE_TYPE_VARIANT[ticket.changeType] ?? 'neutral'}>
            {CHANGE_TYPE_LABEL[ticket.changeType] ?? ticket.changeType}
          </Badge>
          <Badge variant={TICKET_STATUS_VARIANT[ticket.status] ?? 'neutral'}>
            {TICKET_STATUS_LABEL[ticket.status] ?? ticket.status}
          </Badge>
        </div>
        <span className="text-xs text-gray-400">{formatDate(ticket.createdAt)}</span>
      </div>

      {/* Client + site */}
      <div className="text-sm mb-2">
        <span className="font-medium text-gray-900">{ticket.clientName}</span>
        {ticket.siteUrl ? (
          <a
            href={ticket.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-xs text-brand-text hover:underline"
          >
            {ticket.siteUrl}
          </a>
        ) : (
          <span className="ml-2 text-xs text-gray-400">{ticket.siteType}</span>
        )}
      </div>

      {/* Text content */}
      {ticket.textContent && (
        <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto mb-2">
          {ticket.textContent}
        </div>
      )}

      {/* Attachment — thumbnail que abre modal ao clicar */}
      {ticket.attachmentUrl && (
        <div className="mb-2">
          {isMock ? (
            <span className="text-xs text-gray-400 italic">
              📎 {ticket.attachmentUrl.split('/').pop()} (mock)
            </span>
          ) : (
            <button
              onClick={() => onImageClick(ticket.attachmentUrl!)}
              className="block focus:outline-none"
              title="Ver imagem em tamanho completo"
            >
              <img
                src={ticket.attachmentUrl}
                alt="Anexo"
                className="max-h-32 rounded-lg border border-gray-200 object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
              />
            </button>
          )}
        </div>
      )}

      {/* Deadline */}
      <div className={`text-xs mb-3 ${DEADLINE_STYLE[dl]}`}>
        Prazo:{' '}
        {dl === 'overdue'
          ? `VENCIDO em ${formatDate(ticket.deadlineAt)}`
          : dl === 'soon'
            ? `Vence HOJE (${formatDate(ticket.deadlineAt)})`
            : formatDate(ticket.deadlineAt)}
      </div>

      {/* Status actions — 1 clique */}
      {ticket.status !== 'done' && (
        <div className="flex gap-2">
          {ticket.status === 'open' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onStatusChange(ticket.id, 'in_progress')}
            >
              Iniciar atendimento
            </Button>
          )}
          {ticket.status === 'in_progress' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onStatusChange(ticket.id, 'done')}
            >
              Marcar como concluído
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

export function TicketListClient({ tickets: initial }: { tickets: TicketRow[] }) {
  const [tickets, setTickets] = useState(initial)
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'done'>('all')
  const [search, setSearch] = useState('')
  const [imageModal, setImageModal] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleStatusChange(id: string, newStatus: string) {
    setError(null)
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)))
    startTransition(async () => {
      const result = await updateTicketStatus(id, newStatus as 'open' | 'in_progress' | 'done')
      if (result.error) {
        setError(result.error)
        setTickets(initial)
      }
    })
  }

  const byStatus = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter)
  const filtered = search
    ? byStatus.filter(
        (t) =>
          t.clientName.toLowerCase().includes(search.toLowerCase()) ||
          (CHANGE_TYPE_LABEL[t.changeType] ?? t.changeType)
            .toLowerCase()
            .includes(search.toLowerCase()),
      )
    : byStatus

  const counts = {
    open: tickets.filter((t) => t.status === 'open').length,
    in_progress: tickets.filter((t) => t.status === 'in_progress').length,
    done: tickets.filter((t) => t.status === 'done').length,
  }

  return (
    <div>
      {/* Search + filter row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search input */}
        <div className="relative flex-1 max-w-xs">
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
            placeholder="Buscar por cliente ou tipo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 flex-wrap">
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
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-h-[36px] ${
                filter === tab.key
                  ? 'bg-gray-900 text-white'
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
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4">
          {error}
        </p>
      )}

      {isPending && <p className="text-xs text-gray-400 mb-3">Atualizando…</p>}

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            title={
              search
                ? `Nenhuma solicitação para "${search}".`
                : `Nenhuma solicitação${filter !== 'all' ? ` com status "${TICKET_STATUS_LABEL[filter] ?? filter}"` : ''}.`
            }
            className="py-8"
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onStatusChange={handleStatusChange}
              onImageClick={setImageModal}
            />
          ))}
        </div>
      )}

      {/* Image preview modal */}
      <Modal
        open={imageModal !== null}
        onClose={() => setImageModal(null)}
        title="Imagem anexada"
        size="lg"
      >
        {imageModal && (
          <div className="mt-2">
            <img
              src={imageModal}
              alt="Imagem em tamanho completo"
              className="w-full rounded-lg object-contain max-h-[65vh]"
            />
            <div className="mt-3 flex justify-end">
              <a
                href={imageModal}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-text hover:underline"
              >
                Abrir em nova aba →
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
