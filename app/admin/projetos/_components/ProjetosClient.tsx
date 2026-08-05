'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Project, ProjectLabel, ProjectStatus } from '@prisma/client'
import { createProject, updateProject, moveProject, deleteProject } from '../actions'

// ─── Constants ────────────────────────────────────────────────────────────────

const COLUMNS: { status: ProjectStatus; label: string }[] = [
  { status: 'a_fazer', label: 'A fazer' },
  { status: 'em_desenvolvimento', label: 'Em desenvolvimento' },
  { status: 'em_revisao', label: 'Em revisão' },
  { status: 'concluido', label: 'Concluído' },
]

const LABEL_STYLES: Record<ProjectLabel, string> = {
  urgente: 'bg-red-100 text-red-700',
  normal: 'bg-gray-100 text-gray-600',
}

const LABEL_TEXT: Record<ProjectLabel, string> = {
  urgente: 'Urgente',
  normal: 'Normal',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dueDateColor(dueDate: Date): string {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diff = Math.round((due.getTime() - now.getTime()) / 86400000)
  if (diff < 0) return 'text-red-600 font-semibold'
  if (diff <= 2) return 'text-orange-500 font-semibold'
  if (diff <= 5) return 'text-yellow-600'
  return 'text-gray-400'
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function defaultDueDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().split('T')[0]
}

// ─── Move arrows ──────────────────────────────────────────────────────────────

const STATUS_ORDER: ProjectStatus[] = ['a_fazer', 'em_desenvolvimento', 'em_revisao', 'concluido']

function prevStatus(s: ProjectStatus): ProjectStatus | null {
  const i = STATUS_ORDER.indexOf(s)
  return i > 0 ? STATUS_ORDER[i - 1] : null
}

function nextStatus(s: ProjectStatus): ProjectStatus | null {
  const i = STATUS_ORDER.indexOf(s)
  return i < STATUS_ORDER.length - 1 ? STATUS_ORDER[i + 1] : null
}

// ─── Form modal ───────────────────────────────────────────────────────────────

interface ProjectForm {
  title: string
  description: string
  label: ProjectLabel
  dueDate: string
}

function emptyForm(): ProjectForm {
  return { title: '', description: '', label: 'normal', dueDate: defaultDueDate() }
}

interface FormModalProps {
  initial?: ProjectForm & { id: string }
  onClose: () => void
  onSaved: () => void
}

function FormModal({ initial, onClose, onSaved }: FormModalProps) {
  const [form, setForm] = useState<ProjectForm>(
    initial ?? emptyForm(),
  )
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const isEdit = !!initial

  function set(field: keyof ProjectForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function submit() {
    if (!form.title.trim()) { setError('O título é obrigatório.'); return }
    if (!form.dueDate) { setError('O prazo é obrigatório.'); return }
    setError('')
    startTransition(async () => {
      const result = isEdit
        ? await updateProject(initial!.id, form)
        : await createProject(form)
      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        onSaved()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? 'Editar projeto' : 'Novo projeto'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Título *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Ex: Site João Padaria"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Detalhes, observações..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Prioridade</label>
              <select
                value={form.label}
                onChange={(e) => set('label', e.target.value as ProjectLabel)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="normal">Normal</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Prazo *</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => set('dueDate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={isPending}
            className="px-4 py-2 text-sm bg-brand text-brand-dark font-semibold rounded-lg hover:brightness-110 disabled:opacity-60"
          >
            {isPending ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar projeto'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

interface DeleteConfirmProps {
  title: string
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}

function DeleteConfirm({ title, onConfirm, onCancel, isPending }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm px-6 py-5">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Excluir projeto?</h3>
        <p className="text-sm text-gray-600 mb-5">
          "<span className="font-medium">{title}</span>" será removido permanentemente.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 text-sm bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60"
          >
            {isPending ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Project card ─────────────────────────────────────────────────────────────

interface CardProps {
  project: Project
  onEdit: (p: Project) => void
  onDelete: (p: Project) => void
  onMove: (id: string, status: ProjectStatus) => void
  isMoving: boolean
}

function ProjectCard({ project, onEdit, onDelete, onMove, isMoving }: CardProps) {
  const prev = prevStatus(project.status)
  const next = nextStatus(project.status)

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 space-y-2">
      {/* Header: label + actions */}
      <div className="flex items-start justify-between gap-2">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${LABEL_STYLES[project.label]}`}>
          {LABEL_TEXT[project.label]}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(project)}
            className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
            title="Editar"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(project)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Excluir"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-gray-900 leading-snug">{project.title}</p>

      {/* Description */}
      {project.description && (
        <p className="text-xs text-gray-500 line-clamp-2">{project.description}</p>
      )}

      {/* Footer: due date + move arrows */}
      <div className="flex items-center justify-between pt-1">
        <span className={`text-[11px] ${dueDateColor(project.dueDate)}`}>
          {formatDate(project.dueDate)}
        </span>
        <div className="flex items-center gap-1">
          {prev && (
            <button
              onClick={() => onMove(project.id, prev)}
              disabled={isMoving}
              className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-40 transition-colors"
              title="Mover para a esquerda"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {next && (
            <button
              onClick={() => onMove(project.id, next)}
              disabled={isMoving}
              className="p-1 text-gray-700 hover:text-brand disabled:opacity-40 transition-colors"
              title="Mover para a direita"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main client component ────────────────────────────────────────────────────

interface ProjetosClientProps {
  projects: Project[]
}

export function ProjetosClient({ projects: initialProjects }: ProjetosClientProps) {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    setProjects(initialProjects)
  }, [initialProjects])
  const [editTarget, setEditTarget] = useState<Project | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [movingId, setMovingId] = useState<string | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

  function refresh() {
    router.refresh()
    setShowForm(false)
    setEditTarget(null)
  }

  function handleMove(id: string, status: ProjectStatus) {
    setMovingId(id)
    // Optimistic update
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, status } : p))
    moveProject(id, status).then(() => {
      setMovingId(null)
      router.refresh()
    })
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    startDeleteTransition(async () => {
      await deleteProject(deleteTarget.id)
      setDeleteTarget(null)
      router.refresh()
    })
  }

  const byStatus = (status: ProjectStatus) => projects.filter((p) => p.status === status)

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Projetos</h2>
          <p className="text-sm text-gray-500 mt-0.5">Quadro kanban de produção de sites</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-brand-dark text-sm font-semibold rounded-lg hover:brightness-110 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo projeto
        </button>
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[900px]">
          {COLUMNS.map((col) => {
            const cards = byStatus(col.status)
            return (
              <div key={col.status} className="flex-1 min-w-[210px]">
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    {col.label}
                  </h3>
                  <span className="inline-flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-600">
                    {cards.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {cards.length === 0 && (
                    <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center">
                      <p className="text-xs text-gray-400">Nenhum projeto</p>
                    </div>
                  )}
                  {cards.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onEdit={setEditTarget}
                      onDelete={setDeleteTarget}
                      onMove={handleMove}
                      isMoving={movingId === project.id}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Create modal */}
      {showForm && (
        <FormModal
          onClose={() => setShowForm(false)}
          onSaved={refresh}
        />
      )}

      {/* Edit modal */}
      {editTarget && (
        <FormModal
          initial={{
            id: editTarget.id,
            title: editTarget.title,
            description: editTarget.description ?? '',
            label: editTarget.label,
            dueDate: new Date(editTarget.dueDate).toISOString().split('T')[0],
          }}
          onClose={() => setEditTarget(null)}
          onSaved={refresh}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirm
          title={deleteTarget.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isPending={isDeleting}
        />
      )}
    </div>
  )
}
