import Image from 'next/image'
import Link from 'next/link'

export default function CheckoutConfirmedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-[#0a0a0a] relative overflow-hidden">
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Green glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[320px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(34,197,94,0.1) 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-sm text-center">
        <div className="flex justify-center mb-10">
          <Image src="/logo.png" alt="TOP SITE" width={160} height={48} className="h-10 w-auto" priority />
        </div>

        <div
          className="w-20 h-20 rounded-full border border-green-500/30 flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(34,197,94,0.07)' }}
        >
          <svg className="w-9 h-9 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-black text-white mb-3">Pagamento confirmado!</h1>
        <p className="text-zinc-400 text-base leading-relaxed mb-8">
          Recebemos seu pagamento. Agora nossa equipe já está ciente e você receberá
          um e-mail com os próximos passos em breve.
        </p>

        <div
          className="rounded-2xl border border-white/[0.06] p-5 mb-8 text-left space-y-3"
          style={{ background: '#111111' }}
        >
          <p className="text-zinc-400 text-sm font-semibold">O que acontece agora:</p>
          <div className="space-y-2">
            {[
              'Você receberá um e-mail com instruções de acesso ao painel.',
              'Nossa equipe iniciará a produção do seu site.',
              'Entrega em até 7 dias úteis após o envio do briefing.',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-zinc-400 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 w-full bg-yellow-400 hover:bg-yellow-300
                     text-black font-black py-4 rounded-2xl text-sm transition-all
                     hover:shadow-[0_0_25px_rgba(250,204,21,0.4)]"
        >
          Acessar meu painel →
        </Link>

        <p className="text-zinc-700 text-xs mt-6">
          Dúvidas? Fale conosco pelo WhatsApp.
        </p>
      </div>
    </div>
  )
}
