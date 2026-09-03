import Link from 'next/link'
import { COMPANY_NAME, COMPANY_CNPJ } from '@/lib/config'

export const metadata = {
  title: `Termos de Uso — ${COMPANY_NAME}`,
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-text mb-2">
            {COMPANY_NAME}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos de Uso</h1>
          <p className="text-sm text-gray-400">Versão do contrato: 2026-07</p>
        </div>

        <div className="prose prose-sm prose-gray max-w-none space-y-5 text-gray-700 leading-relaxed">
          <p className="font-bold text-base text-gray-900">
            Contrato de Prestação de Serviço de Desenvolvimento de Site
          </p>

          <p>
            <strong>1. Partes:</strong> {COMPANY_NAME}
            {COMPANY_CNPJ ? `, CNPJ ${COMPANY_CNPJ},` : ''} (Contratada) e o Contratante
            identificado no formulário de contratação.
          </p>

          <p>
            <strong>2. Objeto:</strong> desenvolvimento de um site conforme o escopo da
            proposta aprovada e do briefing acordado.
          </p>

          <p>
            <strong>3. Valor e pagamento:</strong> o valor refere-se EXCLUSIVAMENTE ao
            desenvolvimento (criação) do site, no valor de R$ 97,00. Pagamento único via
            Asaas; a confirmação inicia a produção.
          </p>

          <p>
            <strong>4. O que está incluído:</strong> os itens listados como inclusos na
            proposta.
          </p>

          <p>
            <strong>5. Revisão:</strong> 1 (uma) rodada de ajustes dentro do escopo do
            briefing; alterações fora do escopo são orçadas à parte.
          </p>

          <p>
            <strong>6. Prazo de entrega:</strong> o site será entregue em até 7 (sete) dias
            úteis, contados a partir da confirmação do pagamento e do envio, pelo Contratante,
            de todo o conteúdo necessário para a produção.
          </p>

          <p>
            <strong>7. Propriedade:</strong> os arquivos do site pertencem ao Contratante,
            que pode recebê-los mediante solicitação.
          </p>

          <p>
            <strong>8. Responsabilidades do Contratante:</strong> veracidade e legalidade do
            conteúdo, e titularidade/licença de textos e imagens enviados.
          </p>

          <p>
            <strong>9. Serviços não incluídos:</strong> publicação, hospedagem, SSL,
            monitoramento, manutenção, correções e alterações posteriores à entrega, e
            registro de domínio próprio. Tais serviços podem ser contratados separadamente.
          </p>

          <p>
            <strong>10. Direito de arrependimento:</strong> por se tratar de contratação fora
            de estabelecimento físico, o Contratante poderá desistir em até 7 dias corridos,
            desde que a produção não tenha sido iniciada. Uma vez iniciada, por ser serviço
            personalizado e sob encomenda, o valor correspondente ao desenvolvimento já
            realizado não será restituído.
          </p>

          <p>
            <strong>11. Aceite:</strong> ao marcar a caixa e confirmar, o Contratante declara
            ter lido e concordado, manifestando vontade eletrônica com validade jurídica nos
            termos da legislação brasileira. Versão do contrato: 2026-07.
          </p>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
          <Link href="/privacidade" className="text-sm text-brand-text hover:underline">
            Política de Privacidade →
          </Link>
          <Link href="/termos/hospedagem" className="text-sm text-gray-400 hover:text-gray-600">
            Termos de Hospedagem →
          </Link>
        </div>
      </div>
    </div>
  )
}
