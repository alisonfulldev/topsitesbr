import Link from 'next/link'
import { COMPANY_NAME, TERMS_VERSION } from '@/lib/config'
import { getTermsSnapshot } from '@/lib/terms-content'

export const metadata = {
  title: `Termos de Hospedagem — ${COMPANY_NAME}`,
}

export default function TermosHospedagemPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-text mb-2">
            {COMPANY_NAME}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos de Hospedagem</h1>
          <p className="text-sm text-gray-400">Versão {TERMS_VERSION}</p>
        </div>

        {/* Texto da versão vigente — o mesmo registrado no aceite do cliente */}
        <div
          className="text-sm text-gray-700 leading-relaxed [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-gray-900 [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
          dangerouslySetInnerHTML={{ __html: getTermsSnapshot(TERMS_VERSION) }}
        />

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
          <Link href="/privacidade" className="text-sm text-brand-text hover:underline">
            Política de Privacidade →
          </Link>
          <Link href="/termos" className="text-sm text-gray-400 hover:text-gray-600">
            ← Termos de Uso (Criação)
          </Link>
        </div>
      </div>
    </div>
  )
}
