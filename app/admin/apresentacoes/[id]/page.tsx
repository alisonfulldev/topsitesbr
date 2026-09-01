import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { APP_URL } from '@/lib/config'
import CancelButton from './_components/CancelButton'
import CopyLinkButton from './_components/CopyLinkButton'

function statusBadge(status: string) {
  if (status === 'pago') return <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700">Pago</span>
  if (status === 'cancelado') return <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700">Cancelado</span>
  return <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-yellow-100 text-yellow-700">Pendente</span>
}

function planLabel(plan: string | null) {
  if (plan === 'plano1') return 'Plano Site — R$97 (arquivos)'
  if (plan === 'plano2') return 'Plano Essencial — R$97 + R$19/mês'
  if (plan === 'plano3') return 'Plano Completo — R$188 + R$19/mês'
  return '—'
}

export default async function ApresentacaoDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const p = await prisma.templatePresentation.findUnique({ where: { id: params.id } })
  if (!p) notFound()

  const publicLink = `${APP_URL}/modelos/${p.token}`

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/apresentacoes" className="text-sm text-gray-500 hover:text-gray-700">
          ← Apresentações
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h2 className="text-xl font-semibold text-gray-900">{p.leadName}</h2>
          {statusBadge(p.status)}
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Criado em {p.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Link */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Link para o Lead</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded px-3 py-2 text-gray-700 truncate">
            {publicLink}
          </code>
          <CopyLinkButton link={publicLink} />
          <a
            href={publicLink}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs px-3 py-2 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Abrir ↗
          </a>
        </div>
      </div>

      {/* Lead info */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Dados do Lead</p>
        <dl className="space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="text-gray-500 w-24 shrink-0">Nome</dt>
            <dd className="text-gray-900">{p.leadName}</dd>
          </div>
          {p.leadPhone && (
            <div className="flex gap-2">
              <dt className="text-gray-500 w-24 shrink-0">WhatsApp</dt>
              <dd>
                <a
                  href={`https://wa.me/${p.leadPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  {p.leadPhone}
                </a>
              </dd>
            </div>
          )}
          {p.leadEmail && (
            <div className="flex gap-2">
              <dt className="text-gray-500 w-24 shrink-0">E-mail</dt>
              <dd><a href={`mailto:${p.leadEmail}`} className="text-brand hover:underline">{p.leadEmail}</a></dd>
            </div>
          )}
        </dl>
      </div>

      {/* Templates */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Templates</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand/10 text-brand text-xs font-bold shrink-0">1</span>
            <span className="text-gray-900">{p.template1Name}</span>
            <a
              href={`/modelos/${p.token}/preview/1`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-gray-600 ml-auto"
            >
              Preview ↗
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand/10 text-brand text-xs font-bold shrink-0">2</span>
            <span className="text-gray-900">{p.template2Name}</span>
            <a
              href={`/modelos/${p.token}/preview/2`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-gray-600 ml-auto"
            >
              Preview ↗
            </a>
          </div>
        </div>
      </div>

      {/* Payment info */}
      {(p.status === 'pago' || p.planChosen) && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pagamento</p>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-500 w-32 shrink-0">Plano escolhido</dt>
              <dd className="text-gray-900">{planLabel(p.planChosen)}</dd>
            </div>
            {p.paidAt && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-32 shrink-0">Pago em</dt>
                <dd className="text-gray-900">
                  {p.paidAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </dd>
              </div>
            )}
            {p.subdomain && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-32 shrink-0">Subdomínio</dt>
                <dd className="text-gray-900 font-mono text-xs">{p.subdomain}</dd>
              </div>
            )}
            {p.asaasChargeId && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-32 shrink-0">Cobrança Asaas</dt>
                <dd className="text-gray-500 font-mono text-xs">{p.asaasChargeId}</dd>
              </div>
            )}
            {p.asaasSubscriptionId && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-32 shrink-0">Assinatura Asaas</dt>
                <dd className="text-gray-500 font-mono text-xs">{p.asaasSubscriptionId}</dd>
              </div>
            )}
            {p.paymentUrl && p.status !== 'pago' && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-32 shrink-0">Link pagamento</dt>
                <dd>
                  <a href={p.paymentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:underline">
                    Abrir no Asaas ↗
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Notes */}
      {p.notes && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Observações</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{p.notes}</p>
        </div>
      )}

      {/* Actions */}
      {p.status === 'pendente' && (
        <div className="flex justify-end">
          <CancelButton id={p.id} />
        </div>
      )}
    </div>
  )
}
