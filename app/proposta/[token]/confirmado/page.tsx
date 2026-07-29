export default function PropostaConfirmadoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black py-4 px-6">
        <span className="text-brand font-bold text-lg tracking-tight">TOP SITE</span>
      </div>

      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-5">🎉</div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Pagamento recebido!
        </h1>

        <p className="text-gray-500 text-sm leading-relaxed mb-2">
          Recebemos a confirmação do seu pagamento.
        </p>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Acompanhe o andamento do seu projeto diretamente pelo painel — você
          receberá notificações a cada etapa concluída.
        </p>

        <a
          href="/login"
          className="inline-block w-full max-w-xs py-3.5 bg-brand text-brand-dark font-bold rounded-xl hover:bg-brand-hover transition-colors text-sm"
        >
          Acessar o painel →
        </a>

        <p className="text-xs text-gray-400 mt-6">
          Use o e-mail e a senha que você cadastrou ao aprovar a proposta.
        </p>
      </div>
    </div>
  )
}
