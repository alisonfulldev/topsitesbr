import Link from 'next/link'
import { COMPANY_NAME, COMPANY_EMAIL, COMPANY_WHATSAPP, COMPANY_CNPJ } from '@/lib/config'

const LAST_UPDATE = 'setembro de 2026'

export const metadata = {
  title: `Termos de Uso — ${COMPANY_NAME}`,
}

export default function TermosPage() {
  const waLink = `https://wa.me/${COMPANY_WHATSAPP}`

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-text mb-2">
            {COMPANY_NAME}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos de Uso</h1>
          <p className="text-sm text-gray-400">Última atualização: {LAST_UPDATE}</p>
        </div>

        <div className="prose prose-sm prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Objeto e Partes</h2>
            <p>
              Estes Termos de Uso regulam a prestação de serviços de hospedagem, manutenção e
              suporte de sites oferecidos por <strong>{COMPANY_NAME}</strong>
              {COMPANY_CNPJ ? `, CNPJ ${COMPANY_CNPJ},` : ''} ao cliente que contratou os
              serviços por meio do painel de gestão ou por contato direto via WhatsApp.
            </p>
            <p>
              Ao ativar sua assinatura e marcar o aceite neste instrumento, o cliente concorda
              integralmente com todas as disposições abaixo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Planos e Assinatura</h2>
            <p>
              A {COMPANY_NAME} oferece dois planos de hospedagem mensal, sem contrato de
              fidelidade:
            </p>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2 border border-gray-200 font-semibold">Benefício</th>
                    <th className="text-center px-3 py-2 border border-gray-200 font-semibold">Básico — R$ 17/mês</th>
                    <th className="text-center px-3 py-2 border border-gray-200 font-semibold">Plus — R$ 29/mês</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2 border border-gray-200">Site no ar + SSL + monitoramento</td>
                    <td className="text-center px-3 py-2 border border-gray-200">✓</td>
                    <td className="text-center px-3 py-2 border border-gray-200">✓</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-3 py-2 border border-gray-200">Alterações de conteúdo incluídas/mês</td>
                    <td className="text-center px-3 py-2 border border-gray-200">0</td>
                    <td className="text-center px-3 py-2 border border-gray-200">1 (texto OU imagem)</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border border-gray-200">Prazo de execução de alterações</td>
                    <td className="text-center px-3 py-2 border border-gray-200">até 15 dias úteis</td>
                    <td className="text-center px-3 py-2 border border-gray-200">até 7 dias úteis</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-3 py-2 border border-gray-200">Correções ilimitadas e gratuitas</td>
                    <td className="text-center px-3 py-2 border border-gray-200">✓</td>
                    <td className="text-center px-3 py-2 border border-gray-200">✓</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border border-gray-200">Relatório de visitas</td>
                    <td className="text-center px-3 py-2 border border-gray-200 text-gray-400">—</td>
                    <td className="text-center px-3 py-2 border border-gray-200">✓ completo</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-3 py-2 border border-gray-200">Suporte via WhatsApp direto</td>
                    <td className="text-center px-3 py-2 border border-gray-200 text-gray-400">—</td>
                    <td className="text-center px-3 py-2 border border-gray-200">✓</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border border-gray-200">Desconto em serviços avulsos e upsells</td>
                    <td className="text-center px-3 py-2 border border-gray-200 text-gray-400">—</td>
                    <td className="text-center px-3 py-2 border border-gray-200">10%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>Primeiro mês gratuito para novos clientes</li>
              <li>Cobranças mensais automáticas via Pix, boleto ou cartão de crédito, processadas pelo Asaas</li>
              <li>Sem contrato de fidelidade mínima — cancelamento a qualquer momento</li>
              <li>Renovação automática até que o cliente solicite o cancelamento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              3. Diferença entre Correção e Alteração
            </h2>
            <p>
              <strong>Correção</strong>: ajuste de erro pré-existente no site — texto errado,
              link quebrado, dado desatualizado. Ilimitada e gratuita em qualquer plano, não
              consome o limite mensal.
            </p>
            <p className="mt-2">
              <strong>Alteração de conteúdo</strong>: substituição intencional de texto ou
              imagem por novo conteúdo escolhido pelo cliente. Consome o limite mensal do
              plano Plus. Clientes do Básico e alterações além do limite são cobrados avulso:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Alteração de Texto: R$ 20,00</li>
              <li>Alteração de Imagem: R$ 40,00</li>
              <li>Alteração de Texto e Imagem: R$ 60,00 (sempre avulsa, em qualquer plano)</li>
              <li>Nova Seção: R$ 40,00</li>
              <li>Nova Página: R$ 70,00</li>
            </ul>
            <p className="mt-2">
              Assinantes do Plus têm 10% de desconto nos serviços avulsos acima.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Inadimplência</h2>
            <p>
              Em caso de atraso no pagamento, {COMPANY_NAME} notificará o cliente por e-mail
              e pelo painel:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Dia 0</strong>: e-mail de aviso amigável com link para pagamento</li>
              <li><strong>Dia 5</strong>: e-mail de alerta informando que o site será despublicado em 5 dias</li>
              <li><strong>Dia 10</strong>: site temporariamente despublicado</li>
            </ul>
            <p className="mt-2">
              Após a regularização do pagamento, o site é republicado sem cobrança de taxa de
              reativação. Os arquivos do site ficam disponíveis para download no painel mesmo
              durante a inadimplência.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Propriedade do Site</h2>
            <p>
              Os arquivos e o código do site criado para o cliente pertencem ao próprio cliente.
              Os arquivos ficam disponíveis para download no painel a qualquer momento.
              {COMPANY_NAME} não retém nem revende o site do cliente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Cancelamento</h2>
            <p>
              O cliente pode cancelar a assinatura a qualquer momento pelo WhatsApp ou pelo
              painel. Após o cancelamento, o site será despublicado e a assinatura encerrada.
              Não há multa ou taxa de cancelamento. Valores já pagos não são reembolsados, exceto
              nos casos previstos em lei.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Direito de Arrependimento</h2>
            <p>
              De acordo com o Código de Defesa do Consumidor (art. 49), contratos celebrados fora
              do estabelecimento comercial — inclusive por meio digital — admitem arrependimento em
              até 7 (sete) dias corridos a contar da contratação, com devolução integral dos valores
              pagos. Para exercer esse direito, entre em contato por{' '}
              <a href={`mailto:${COMPANY_EMAIL}`} className="text-brand-text hover:underline">
                {COMPANY_EMAIL}
              </a>{' '}
              ou{' '}
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-brand-text hover:underline">
                WhatsApp
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Disponibilidade</h2>
            <p>
              {COMPANY_NAME} envidará seus melhores esforços para manter o site do cliente online
              de forma contínua. Eventuais indisponibilidades técnicas não gerarão direito a
              desconto ou reembolso, salvo quando comprovada negligência do prestador.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Responsabilidades do Cliente</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Manter seus dados cadastrais atualizados, incluindo CPF/CNPJ, e-mail e telefone</li>
              <li>
                Garantir que os conteúdos enviados para publicação (textos, imagens) não violam
                direitos de terceiros, não são difamatórios, ilegais ou enganosos
              </li>
              <li>Manter sua senha de acesso ao painel em sigilo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">10. Alteração dos Termos</h2>
            <p>
              {COMPANY_NAME} pode atualizar estes Termos a qualquer momento. O cliente será
              notificado por e-mail e no painel. O uso continuado dos serviços após a comunicação
              das alterações implica aceite das novas condições.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">11. Lei Aplicável e Foro</h2>
            <p>
              Estes Termos são regidos pelas leis da República Federativa do Brasil. As partes
              elegem o Foro da Comarca de São Paulo/SP para dirimir eventuais conflitos, sem
              prejuízo de outros meios alternativos de resolução de disputas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">12. Contato</h2>
            <p>
              Dúvidas e solicitações:{' '}
              <a href={`mailto:${COMPANY_EMAIL}`} className="text-brand-text hover:underline">
                {COMPANY_EMAIL}
              </a>
              {' '}|{' '}
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-brand-text hover:underline">
                WhatsApp
              </a>
            </p>
          </section>
        </div>

        <div className="mt-8 p-5 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
          <p className="font-semibold mb-1">Nota — oferta de criação de site (R$ 97)</p>
          <p>
            Se você chegou aqui a partir da nossa oferta de criação de site, saiba que o
            pagamento de <strong>R$ 97,00 é exclusivamente pela criação do site</strong> —
            você recebe os arquivos finais e eles são seus, sem qualquer cobrança recorrente.
            Os planos de hospedagem descritos acima são um serviço <strong>separado e
            opcional</strong>: para deixar o site acessível na internet é necessário contratar
            um plano de hospedagem (a partir de R$ 19/mês, sem fidelidade). Sem a hospedagem,
            você recebe os arquivos e pode hospedá-los onde preferir.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
          <Link href="/privacidade" className="text-sm text-brand-text hover:underline">
            Política de Privacidade →
          </Link>
          <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">
            ← Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  )
}
