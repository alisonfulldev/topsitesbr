'use client'

import { ProjectCTA } from '@/components/marketing/MarketingSections'

function WordReveal({ text, baseDelay, className }: { text: string; baseDelay: number; className?: string }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, i) => (
        <span
          key={i}
          className={`inline-block ${className ?? ''}`}
          style={{ animation: `herFadeUp 0.55s cubic-bezier(0.16,1,0.3,1) ${(baseDelay + i * 0.09).toFixed(2)}s both` }}
        >
          {word}{i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  )
}

const DOTS = [
  { style: { top: '16%', left: '3%' } as React.CSSProperties,   dotDelay: 0.42, ringDelay: 0.55 },
  { style: { top: '72%', left: '5%' } as React.CSSProperties,   dotDelay: 0.68, ringDelay: 0.82 },
  { style: { top: '26%', right: '3%' } as React.CSSProperties,  dotDelay: 0.55, ringDelay: 0.68 },
  { style: { top: '63%', right: '5%' } as React.CSSProperties,  dotDelay: 0.82, ringDelay: 0.95 },
]

export function AnimatedHero() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-8 sm:py-24 lg:py-32">
      <style>{`
        @keyframes herFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes herFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes herRadar {
          0%   { transform: scale(0.12); opacity: 0.9; }
          100% { transform: scale(3.2);  opacity: 0; }
        }
        @keyframes herScan {
          0%   { transform: translateY(-4px); opacity: 0; }
          4%   { opacity: 1; }
          88%  { opacity: 0.45; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes herDot {
          0%   { transform: scale(0);    opacity: 0; }
          65%  { transform: scale(1.35); opacity: 1; }
          100% { transform: scale(1);    opacity: 1; }
        }
        @keyframes herRing {
          0%   { transform: scale(1);   opacity: 0.65; }
          100% { transform: scale(4);   opacity: 0; }
        }
        @keyframes herGridPulse {
          0%, 100% { opacity: 0.035; }
          50%       { opacity: 0.07; }
        }
      `}</style>

      {/* Grid — pulsa suavemente após o carregamento */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(#facc15 1px, transparent 1px), linear-gradient(90deg, #facc15 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'linear-gradient(to bottom, black, transparent)',
          animation: 'herGridPulse 5s ease-in-out 2.5s infinite',
          opacity: 0.035,
        }}
      />

      {/* Radar — 3 anéis expandindo do centro-direito onde fica o titular */}
      <div aria-hidden="true" className="pointer-events-none absolute left-[52%] top-[38%] -translate-x-1/2 -translate-y-1/2">
        {([0.05, 0.42, 0.78] as number[]).map((delay, i) => (
          <div
            key={i}
            className="absolute h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-400/55"
            style={{ animation: `herRadar 2.1s ease-out ${delay}s both` }}
          />
        ))}
      </div>

      {/* Linha de varredura — percorre a tela uma vez */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/55 to-transparent"
        style={{ animation: 'herScan 1.3s ease-in 0s both' }}
      />

      {/* Pontos de sinal nos cantos — só desktop */}
      {DOTS.map(({ style, dotDelay, ringDelay }, i) => (
        <div key={i} aria-hidden="true" className="pointer-events-none absolute hidden lg:block" style={style}>
          <div className="relative h-2 w-2">
            <div
              className="absolute inset-0 rounded-full bg-yellow-400"
              style={{ animation: `herDot 0.5s cubic-bezier(0.34,1.56,0.64,1) ${dotDelay}s both` }}
            />
            <div
              className="absolute -inset-2 rounded-full border border-yellow-400/50"
              style={{ animation: `herRing 1.6s ease-out ${ringDelay}s both` }}
            />
          </div>
        </div>
      ))}

      {/* Brilho ambiente amarelo */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-yellow-400/[0.04] blur-3xl" />

      {/* Conteúdo */}
      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-7 text-[2.65rem] font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            <WordReveal text="Você nos encontrou pela internet." baseDelay={0.82} />
            <span className="block text-yellow-400">
              <WordReveal text="Não foi acidente." baseDelay={1.26} />
            </span>
          </h1>
          <p
            className="mb-4 max-w-2xl text-xl font-semibold leading-snug sm:text-2xl"
            style={{ animation: 'herFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 1.68s both' }}
          >
            E é exatamente assim que seus clientes vão te encontrar.
          </p>
          <p
            className="mb-9 max-w-2xl text-lg leading-relaxed text-white/70"
            style={{ animation: 'herFadeIn 0.65s ease 1.9s both' }}
          >
            A forma como chegou até nós é o nosso método funcionando. Aplicamos o mesmo em sites para
            empresas — e elas passam a ser encontradas por quem já busca o que oferecem.
          </p>
          <div
            className="flex flex-wrap items-center gap-6"
            style={{ animation: 'herFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 2.1s both' }}
          >
            <ProjectCTA label="Quero que me encontrem assim" />
          </div>
          <p
            className="mt-7 text-sm text-white/50"
            style={{ animation: 'herFadeIn 0.5s ease 2.35s both' }}
          >
            Atendimento consultivo · Proposta personalizada · Todo o Brasil
          </p>
        </div>
      </div>
    </section>
  )
}
