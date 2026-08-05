import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getTermsContentFromDb } from '@/lib/terms-content'
import { COMPANY_NAME, APP_URL } from '@/lib/config'
import { PrintButton } from './_components/PrintButton'

export default async function ComprovantePage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const client = await prisma.client.findUnique({
    where: { id: params.id },
    select: {
      name: true,
      email: true,
      document: true,
      termsAcceptedAt: true,
      termsVersion: true,
    },
  })

  if (!client || !client.termsAcceptedAt) notFound()

  const version = client.termsVersion ?? '1.0'
  const termsContent = await getTermsContentFromDb(version)

  const dateStr = client.termsAcceptedAt.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo',
  })
  const timeStr = client.termsAcceptedAt.toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Sao_Paulo',
  })
  const generatedAt = new Date().toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })

  return (
    <>
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-page { box-shadow: none !important; border: none !important; }
        }
        .terms-content h3 {
          font-size: 15px;
          font-weight: 700;
          color: #111827;
          margin: 20px 0 8px;
        }
        .terms-content p { margin: 0 0 10px; }
        .terms-content ul {
          margin: 0 0 12px;
          padding-left: 20px;
        }
        .terms-content li { margin-bottom: 4px; }
      `}} />

      <div className="min-h-screen bg-gray-100 py-8 px-4 print:bg-white print:py-0">
        {/* Toolbar — hidden on print */}
        <div className="no-print max-w-3xl mx-auto mb-4 flex items-center justify-between">
          <a
            href={`/admin/clientes/${params.id}`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Voltar ao cliente
          </a>
          <PrintButton />
        </div>

        {/* Document */}
        <div className="print-page max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Header */}
          <div className="bg-blue-700 px-8 py-6 text-white">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">{COMPANY_NAME}</p>
              <p className="text-xs opacity-60">Gerado em {generatedAt}</p>
            </div>
            <h1 className="text-2xl font-bold">Comprovante de Aceite dos Termos de Uso</h1>
            <p className="text-sm opacity-80 mt-1">
              Este documento registra o aceite formal dos Termos de Uso e da Política de Privacidade
              pelo cliente ao ativar a assinatura do plano Site no Ar.
            </p>
          </div>

          {/* Client info + acceptance data */}
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Dados do aceite</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              <div>
                <dt className="text-xs text-gray-500">Nome do cliente</dt>
                <dd className="text-sm font-semibold text-gray-900 mt-0.5">{client.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">E-mail</dt>
                <dd className="text-sm font-semibold text-gray-900 mt-0.5">{client.email}</dd>
              </div>
              {client.document && (
                <div>
                  <dt className="text-xs text-gray-500">CPF / CNPJ</dt>
                  <dd className="text-sm font-semibold text-gray-900 mt-0.5">{client.document}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-500">Data e hora do aceite</dt>
                <dd className="text-sm font-semibold text-green-700 mt-0.5">
                  {dateStr} às {timeStr} (horário de Brasília)
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Versão dos termos aceitos</dt>
                <dd className="text-sm font-semibold text-gray-900 mt-0.5">v{version}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Plataforma</dt>
                <dd className="text-sm font-semibold text-gray-900 mt-0.5">{APP_URL}</dd>
              </div>
            </dl>
          </div>

          {/* Alert: inadimplência */}
          <div className="mx-8 my-6 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1">⚠️ Cláusula de inadimplência — aceita pelo cliente</p>
            <p className="text-sm text-red-800 leading-relaxed">
              Sites com mensalidade em aberto por mais de <strong>10 dias</strong> são{' '}
              <strong>temporariamente despublicados</strong> até a regularização do pagamento,
              conforme Seção 5 (Inadimplência) dos Termos de Uso aceitos nesta data.
              Não há cobrança de taxa de reativação.
            </p>
          </div>

          {/* Full terms snapshot */}
          <div className="px-8 pb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 pt-2 border-t border-gray-100">
              Texto integral dos Termos de Uso — versão {version} (snapshot no momento do aceite)
            </h2>
            <div
              className="terms-content text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: termsContent ?? '' }}
            />
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 text-center">
            Comprovante gerado automaticamente pelo sistema {COMPANY_NAME} em {generatedAt}.
            O aceite foi registrado quando o cliente marcou o checkbox "Li e concordo com os Termos de Uso"
            e clicou em "Ativar" na tela de ativação do plano.
          </div>
        </div>
      </div>
    </>
  )
}
