import Link from 'next/link'
import { COMPANY_NAME, COMPANY_EMAIL, COMPANY_WHATSAPP, COMPANY_CNPJ } from '@/lib/config'

const LAST_UPDATE = '23 de julho de 2026'

export const metadata = {
  title: `Política de Privacidade — ${COMPANY_NAME}`,
}

export default function PrivacidadePage() {
  const waLink = `https://wa.me/${COMPANY_WHATSAPP}`

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-text mb-2">
            {COMPANY_NAME}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
          <p className="text-sm text-gray-400">Última atualização: {LAST_UPDATE}</p>
        </div>

        <div className="prose prose-sm prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Controlador dos Dados</h2>
            <p>
              O controlador dos seus dados pessoais é <strong>{COMPANY_NAME}</strong>
              {COMPANY_CNPJ ? `, CNPJ ${COMPANY_CNPJ}` : ' (TODO: preencher CNPJ)'},
              com contato pelo e-mail{' '}
              <a href={`mailto:${COMPANY_EMAIL}`} className="text-brand-text hover:underline">
                {COMPANY_EMAIL}
              </a>
              {' '}ou{' '}
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-brand-text hover:underline">
                WhatsApp
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Dados Coletados</h2>
            <p>Coletamos os seguintes dados pessoais para prestação dos nossos serviços:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Dados de identificação</strong>: nome completo, CPF ou CNPJ</li>
              <li><strong>Dados de contato</strong>: e-mail e número de telefone/WhatsApp</li>
              <li>
                <strong>Dados de pagamento</strong>: processados pelo Asaas (gateway de pagamento);
                não armazenamos dados de cartão de crédito em nossos servidores
              </li>
              <li>
                <strong>Dados de uso</strong>: informações sobre acesso ao painel, solicitações
                abertas e interações com o serviço
              </li>
              <li>
                <strong>Conteúdo do site</strong>: textos e imagens enviados pelo cliente para
                publicação no site
              </li>
              <li>
                <strong>Dados de analytics</strong>: visitas ao site do cliente, processadas de
                forma agregada (sem identificação de visitantes individuais)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Finalidades e Bases Legais</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Finalidade</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Base Legal (LGPD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-2.5">Prestação dos serviços contratados</td>
                    <td className="px-4 py-2.5">Execução de contrato (art. 7º, V)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5">Cobrança e gestão financeira</td>
                    <td className="px-4 py-2.5">Execução de contrato e obrigação legal (art. 7º, II e V)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5">Envio de notificações e e-mails transacionais</td>
                    <td className="px-4 py-2.5">Execução de contrato (art. 7º, V)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5">Melhorias no serviço e análise de uso</td>
                    <td className="px-4 py-2.5">Legítimo interesse (art. 7º, IX)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5">Cumprimento de obrigações legais e fiscais</td>
                    <td className="px-4 py-2.5">Obrigação legal (art. 7º, II)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Compartilhamento com Terceiros</h2>
            <p>Seus dados são compartilhados exclusivamente com os seguintes operadores de dados:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                <strong>Asaas</strong> — gateway de pagamentos (cobrança e assinatura mensal).
                Política de privacidade em <a href="https://asaas.com/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="text-brand-text hover:underline">asaas.com</a>
              </li>
              <li>
                <strong>Supabase</strong> — banco de dados e armazenamento de arquivos, hospedado
                na AWS região sa-east-1 (São Paulo)
              </li>
              <li>
                <strong>Resend</strong> — envio de e-mails transacionais
              </li>
              <li>
                <strong>Vercel</strong> — hospedagem da aplicação web
              </li>
            </ul>
            <p className="mt-3">
              Não vendemos nem cedemos seus dados pessoais a terceiros para fins comerciais ou
              publicitários.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Analytics</h2>
            <p>
              O relatório de visitas do site do cliente exibe dados agregados de tráfego (número
              de visitas, páginas acessadas, origem do tráfego). Esses dados são coletados de forma
              anônima — não identificamos individualmente os visitantes do site do cliente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Direitos do Titular</h2>
            <p>
              Nos termos da Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018), você tem
              direito a:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Confirmar a existência de tratamento dos seus dados</li>
              <li>Acessar seus dados</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>Portabilidade dos dados a outro fornecedor</li>
              <li>Revogar o consentimento, quando o tratamento se basear nessa base legal</li>
              <li>Oposição ao tratamento baseado em legítimo interesse</li>
            </ul>
            <p className="mt-3">
              Para exercer seus direitos, entre em contato por{' '}
              <a href={`mailto:${COMPANY_EMAIL}`} className="text-brand-text hover:underline">
                {COMPANY_EMAIL}
              </a>
              . Responderemos em até 15 dias úteis.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Retenção dos Dados</h2>
            <p>
              Mantemos seus dados pelo prazo necessário à prestação dos serviços contratados e
              ao cumprimento de obrigações legais (em especial fiscais e contábeis — mínimo de 5
              anos após o encerramento do contrato). Após esse prazo, os dados são eliminados ou
              anonimizados.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Segurança</h2>
            <p>
              Adotamos medidas técnicas e administrativas para proteger seus dados contra acesso
              não autorizado, uso indevido, perda ou destruição, incluindo criptografia em
              trânsito (HTTPS/TLS), autenticação segura e controle de acesso por papel (admin/
              cliente).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Cookies</h2>
            <p>
              Utilizamos cookies de sessão estritamente necessários para manter o login no painel.
              Não utilizamos cookies de rastreamento ou publicidade de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">10. Alterações nesta Política</h2>
            <p>
              Esta Política pode ser atualizada periodicamente. Alterações relevantes serão
              comunicadas por e-mail e notificação no painel. O uso continuado após a comunicação
              implica aceite das mudanças.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">11. Contato do Controlador</h2>
            <p>
              <strong>{COMPANY_NAME}</strong>
              {COMPANY_CNPJ ? ` — CNPJ: ${COMPANY_CNPJ}` : ' (TODO: preencher CNPJ)'}<br />
              E-mail:{' '}
              <a href={`mailto:${COMPANY_EMAIL}`} className="text-brand-text hover:underline">
                {COMPANY_EMAIL}
              </a>
              <br />
              WhatsApp:{' '}
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-brand-text hover:underline">
                Clique para contato
              </a>
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
          <Link href="/termos" className="text-sm text-brand-text hover:underline">
            ← Termos de Uso
          </Link>
          <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">
            Voltar ao login →
          </Link>
        </div>
      </div>
    </div>
  )
}
