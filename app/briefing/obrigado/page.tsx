import Image from 'next/image'

export default function BriefingObrigadoPage() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Image src="/logo.png" alt="TOP SITE" width={100} height={30} className="h-7 w-auto mb-10 opacity-70" />

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 md:p-10 text-center">
        {/* Ícone */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)' }}>
          <svg className="w-10 h-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">Briefing enviado com sucesso!</h1>
        <p className="text-brand font-semibold text-sm mb-6">✅ Recebemos suas informações.</p>

        <div className="text-left bg-gray-50 rounded-2xl p-5 space-y-3 text-sm text-gray-700 leading-relaxed mb-6">
          <p>
            Já vamos começar a desenvolver a prévia do seu site.
            Você receberá os modelos em até <strong>3 dias úteis</strong>.
          </p>
          <p>
            Mas não para por aí: a prévia é só o começo. Vamos personalizar seu site
            com você, ajustando cores, imagens, textos e o que mais for preciso, até
            ficar com a cara do seu negócio.
          </p>
          <p>
            O projeto inclui <strong>1 rodada de ajustes</strong> — por isso, ao
            receber a prévia, revise com atenção e envie todas as alterações de uma vez.
          </p>
        </div>

        <p className="text-xs text-gray-400">
          Dúvidas? Fale conosco pelo WhatsApp a qualquer momento.
        </p>
      </div>
    </main>
  )
}
