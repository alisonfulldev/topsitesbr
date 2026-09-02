import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { upsertTemplate } from './actions'
import TemplateSubmitButton from './_components/TemplateSubmitButton'

async function TemplateSlotForm({ slot, current }: { slot: 1 | 2; current: { name: string; updatedAt: Date } | null }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Template {slot}</h3>
          {current ? (
            <p className="text-xs text-gray-400 mt-0.5">
              <span className="font-medium text-gray-600">{current.name}</span> · atualizado {current.updatedAt.toLocaleDateString('pt-BR')}
            </p>
          ) : (
            <p className="text-xs text-amber-600 mt-0.5">Não configurado — nenhum HTML subido ainda</p>
          )}
        </div>
        {current && (
          <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Ativo
          </span>
        )}
      </div>

      <form action={upsertTemplate} className="space-y-3">
        <input type="hidden" name="slot" value={slot} />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Nome do template <span className="text-red-400">*</span>
          </label>
          <input
            name="name"
            type="text"
            required
            defaultValue={current?.name ?? ''}
            placeholder={`Ex: Modelo ${slot === 1 ? 'Moderno' : 'Clássico'}`}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Arquivo HTML <span className="text-red-400">*</span>
          </label>
          <input
            name="html"
            type="file"
            accept=".html,.htm"
            required
            className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
          />
        </div>
        <div className="flex justify-end pt-1">
          <TemplateSubmitButton label={current ? 'Atualizar template' : 'Subir template'} />
        </div>
      </form>
    </div>
  )
}

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const [t1, t2] = await Promise.all([
    prisma.systemTemplate.findUnique({ where: { slot: 1 } }),
    prisma.systemTemplate.findUnique({ where: { slot: 2 } }),
  ])

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/apresentacoes" className="text-sm text-gray-500 hover:text-gray-700">
          ← Apresentações
        </Link>
        <h2 className="text-xl font-semibold text-gray-900 mt-2">Templates Globais</h2>
        <p className="text-sm text-gray-500 mt-1">
          Estes 2 HTMLs aparecem para todos os leads que acessarem qualquer link de apresentação.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <TemplateSlotForm slot={1} current={t1} />
        <TemplateSlotForm slot={2} current={t2} />
      </div>

      {(!t1 || !t2) && (
        <div className="mt-5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
          ⚠️ {!t1 && !t2 ? 'Nenhum template configurado' : `Template ${!t1 ? '1' : '2'} não configurado`} — os leads verão uma tela de erro ao tentar visualizar os modelos.
        </div>
      )}
    </div>
  )
}
