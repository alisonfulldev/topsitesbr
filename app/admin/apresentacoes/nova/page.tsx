import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { createPresentation } from '../actions'
import SubmitButton from './_components/SubmitButton'

export default async function NovaApresentacaoPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/apresentacoes" className="text-sm text-gray-500 hover:text-gray-700">
          ← Apresentações
        </Link>
        <h2 className="text-xl font-semibold text-gray-900 mt-2">Nova Apresentação</h2>
        <p className="text-sm text-gray-500 mt-1">
          Suba os dois templates HTML e gere o link exclusivo para o lead.
        </p>
      </div>

      <form action={createPresentation} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da pessoa (lead) <span className="text-red-500">*</span>
            </label>
            <input
              name="leadPersonName"
              type="text"
              required
              placeholder="Ex: João Silva"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
            />
            <p className="text-xs text-gray-400 mt-1">Usado na saudação "Olá, João!"</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da empresa / negócio <span className="text-red-500">*</span>
            </label>
            <input
              name="leadName"
              type="text"
              required
              placeholder="Ex: Barbearia do João"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
            />
            <p className="text-xs text-gray-400 mt-1">Aparece no mockup do Google</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <input
              name="leadPhone"
              type="tel"
              placeholder="11 99999-9999"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              name="leadEmail"
              type="email"
              placeholder="lead@email.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
            />
          </div>
        </div>

        <hr className="border-gray-100" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template 1 (HTML) <span className="text-red-500">*</span>
            </label>
            <input
              name="template1"
              type="file"
              accept=".html,.htm"
              required
              className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Template 1 <span className="text-red-500">*</span>
            </label>
            <input
              name="template1Name"
              type="text"
              required
              placeholder="Ex: Modelo Moderno"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template 2 (HTML) <span className="text-red-500">*</span>
            </label>
            <input
              name="template2"
              type="file"
              accept=".html,.htm"
              required
              className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Template 2 <span className="text-red-500">*</span>
            </label>
            <input
              name="template2Name"
              type="text"
              required
              placeholder="Ex: Modelo Clássico"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
            />
          </div>
        </div>

        <hr className="border-gray-100" />

        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Preços</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: 'pricePlano1', label: 'Plano 1 (criação)', defaultValue: 97 },
              { name: 'pricePlano2', label: 'Plano 2 (criação)', defaultValue: 97 },
              { name: 'pricePlano3', label: 'Plano 3 (criação)', defaultValue: 188 },
              { name: 'priceMonthly', label: 'Mensalidade', defaultValue: 19 },
            ].map(({ name, label, defaultValue }) => (
              <div key={name}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
                  <input
                    name={name}
                    type="number"
                    min={1}
                    step={1}
                    defaultValue={defaultValue}
                    required
                    className="w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Plano 1 = só os arquivos, Plano 2 = hospedagem, Plano 3 = hospedagem + domínio.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações internas</label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Anotações sobre o lead, conversa no WhatsApp, etc."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/admin/apresentacoes"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </Link>
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}
