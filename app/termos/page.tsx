import Link from 'next/link'
import { COMPANY_NAME, COMPANY_EMAIL, COMPANY_WHATSAPP, COMPANY_CNPJ } from '@/lib/config'

const LAST_UPDATE = '23 de julho de 2026'

export const metadata = {
  title: `Termos de Uso — ${COMPANY_NAME}`,
}

export default function TermosPage() {
  const waLink = `https://wa.me/${COMPANY_WHATSAPP}`

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
        {/* Header */}
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
              Estes Termos de Uso regulam a prestação de serviços de hospedagem, manutenção e suporte
              de sites oferecidos por <strong>{COMPANY_NAME}</strong>
              {COMPANY_CNPJ ? `, CNPJ ${COMPANY_CNPJ},` : ' (TODO: preencher CNPJ)'} ao cliente
              que contratou os serviços por meio do painel de gestão disponível em nosso site
              ou por contato direto via WhatsApp.
            </p>
            <p>
              Ao ativar sua assinatura e marcar o aceite neste instrumento, o cliente concorda
              integralmente com todas as disposições abaixo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Plano e Assinatura</h2>
            <p>
              O plano contratado é o <strong>Site no Ar</strong>, com as seguintes características:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Valor: <strong>R$ 29,00 por mês</strong></li>
              <li>
                Primeiro mês gratuito para novos clientes; a partir do segundo mês a cobrança
                mensal será iniciada automaticamente na data definida no painel
              </li>
              <li>Cobranças mensais automáticas via Pix, boleto ou cartão de crédito, processadas pelo Asaas</li>
              <li>Sem contrato de fidelidade mínima — o cliente pode cancelar a qualquer momento</li>
              <li>Renovação automática até que o cliente solicite o cancelamento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. O que está incluído</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Hospedagem do site com SSL ativo e renovado automaticamente</li>
              <li>Monitoramento 24h com notificação em caso de queda</li>
              <li>
                <strong>1 (uma) alteração de conteúdo por mês</strong> — texto ou imagem —
                com prazo de execução de até 7 dias úteis
              </li>
              <li>
                <strong>Correções ilimitadas e gratuitas</strong>: erros de digitação, links
                quebrados, dados desatualizados (telefone, endereço). Correções não consomem o
                limite mensal de alterações
              </li>
              <li>Suporte via WhatsApp direto</li>
              <li>Relatório mensal de visitas (visitantes, origem, páginas mais vistas)</li>
              <li>10% de desconto em serviços e upgrades avulsos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              4. Diferença entre Correção e Alteração
            </h2>
            <p>
              <strong>Correção</strong>: ajuste de erro pré-existente no site — texto errado, link
              quebrado, dado desatualizado. Ilimitada e gratuita em qualquer plano.
            </p>
            <p className="mt-2">
              <strong>Alteração de conteúdo</strong>: substituição intencional de texto ou imagem
              por novo conteúdo escolhido pelo cliente (ex: nova promoção, nova foto). Consome o
              limite mensal. Alterações além do limite mensal são cobradas avulso:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Alteração de texto: R$ 20,00</li>
              <li>Alteração de imagem: R$ 40,00</li>
              <li>Alteração de texto e imagem: R$ 60,00</li>
              <li>Nova seção: R$ 40,00</li>
              <li>Nova página: R$ 70,00</li>
            </ul>
            <p className="mt-2">
              Serviços avulsos têm desconto de 10% para assinantes do plano Site no Ar.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Inadimplência</h2>
            <p>
              Em caso de atraso no pagamento, {COMPANY_NAME} notificará o cliente por e-mail e
              pelo painel. O fluxo de inadimplência funciona da seguinte forma:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Dia 0</strong>: e-mail de aviso amigável com link para pagamento</li>
              <li><strong>Dia 5</strong>: e-mail de alerta informando que o site será despublicado em 5 dias</li>
              <li>
                <strong>Dia 10</strong>: site temporariamente despublicado. Notificação interna
                ao administrador para remoção do site do ar
              </li>
            </ul>
            <p className="mt-2">
              Após a regularização do pagamento, o site é republicado sem cobrança de taxa de
              reativação. Os arquivos do site ficam disponíveis para download no painel mesmo
              durante a inadimplência.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Propriedade do Site</h2>
            <p>
              Os arquivos e o código do site criado para o cliente pertencem ao próprio cliente.
              Os arquivos ficam disponíveis para download no painel a qualquer momento.
              {COMPANY_NAME} não retém nem revende o site do cliente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Cancelamento</h2>
            <p>
              O cliente pode cancelar a assinatura a qualquer momento pelo WhatsApp ou pelo
              painel. Após o cancelamento, o site será despublicado e a assinatura encerrada.
              Não há multa ou taxa de cancelamento. Valores já pagos não são reembolsados, exceto
              nos casos previstos em lei.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              8. Direito de Arrependimento
            </h2>
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
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Disponibilidade</h2>
            <p>
              {COMPANY_NAME} envidará seus melhores esforços para manter o site do cliente online
              de forma contínua. Eventuais indisponibilidades técnicas não gerarão direito a
              desconto ou reembolso, salvo quando comprovada negligência do prestador.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              10. Responsabilidades do Cliente
            </h2>
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
            <h2 className="text-lg font-bold text-gray-900 mb-3">11. Alteração dos Termos</h2>
            <p>
              {COMPANY_NAME} pode atualizar estes Termos a qualquer momento. O cliente será
              notificado por e-mail e no painel. O uso continuado dos serviços após a comunicação
              das alterações implica aceite das novas condições.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">12. Lei Aplicável e Foro</h2>
            <p>
              Estes Termos são regidos pelas leis da República Federativa do Brasil. As partes
              elegem o Foro da Comarca de São Paulo/SP para dirimir eventuais conflitos, sem
              prejuízo de outros meios alternativos de resolução de disputas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">13. Contato</h2>
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

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
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
