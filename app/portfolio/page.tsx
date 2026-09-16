import type { Metadata } from 'next'
import Script from 'next/script'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

/* ─── Config ──────────────────────────────────────────────────────────────── */

const BASE_URL = 'https://topsitebr.com.br'
const WA_NUMBER = '5518996742364'
const MSG = 'Olá! Quero criar meu site profissional por R$197. Como funciona?'
function wa() { return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(MSG)}` }

/* ─── SEO ─────────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'Portfólio — Sites que Criamos | TOP SITE',
  description:
    'Veja os sites profissionais que já criamos. Projetos para diferentes segmentos, com foco em apresentação, navegação e contato.',
  alternates: { canonical: `${BASE_URL}/portfolio` },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/portfolio`,
    title: 'Portfólio — Sites que Criamos | TOP SITE',
    description: 'Veja os sites profissionais que já criamos. Projetos para diferentes segmentos e necessidades.',
    siteName: 'TOP SITE',
    locale: 'pt_BR',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Portfólio TOP SITE' }],
  },
}

/* ─── JSON-LD ─────────────────────────────────────────────────────────────── */

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Portfólio de Sites Criados pela TOP SITE',
  description: 'Sites profissionais criados para clientes reais, otimizados para o Google.',
  url: `${BASE_URL}/portfolio`,
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Estética Del Soares',
      description: 'Site profissional para clínica estética.',
      url: 'https://esteticadelsoares.com.br',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'OZ Energia Solar',
      description: 'Site profissional para empresa de energia solar.',
      url: 'https://ozenergiasolar.com.br',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Yasmim Pinho Psicóloga',
      description: 'Site profissional para psicóloga.',
      url: 'https://yasmimpinhopsicologa.com.br',
    },
  ],
}

/* ─── Dados dos cases ─────────────────────────────────────────────────────── */

const cases = [
  {
    domain: 'esteticadelsoares.com.br',
    name: 'Estética Del Soares',
    segment: 'Clínica Estética',
    query: 'clínica estética tratamentos faciais',
    desc: 'Tratamentos faciais e corporais com profissionais especializados. Resultados visíveis e atendimento personalizado.',
    links: ['Serviços', 'Agendar', 'Contato'],
    favicon: '/faicon/del.png',
  },
  {
    domain: 'ozenergiasolar.com.br',
    name: 'OZ Energia Solar',
    segment: 'Energia Solar',
    query: 'energia solar instalação residencial',
    desc: 'Instalação de painéis solares com economia garantida na conta de luz. Orçamento grátis em 24h.',
    links: ['Orçamento Grátis', 'Projetos', 'Contato'],
    favicon: '/faicon/oz.png',
  },
  {
    domain: 'yasmimpinhopsicologa.com.br',
    name: 'Yasmim Pinho Psicóloga',
    segment: 'Psicologia',
    query: 'psicóloga atendimento online e presencial',
    desc: 'Atendimento psicológico online e presencial. Ambiente acolhedor, sigilo garantido e agenda flexível.',
    links: ['Sobre', 'Agendamento', 'Contato'],
    favicon: '/faicon/yasmin.png',
  },
]

/* ─── Componente SERP Mockup ──────────────────────────────────────────────── */

function SerpMockup({ p }: { p: typeof cases[number] }) {
  return (
    /* Browser frame */
    <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-700" style={{ background: '#1e1e1e' }}>
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-700" style={{ background: '#2a2a2a' }}>
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <div className="flex-1 mx-3 px-3 py-1 rounded text-xs text-gray-400 border border-gray-600" style={{ background: '#1a1a1a' }}>
          google.com
        </div>
      </div>

      {/* Google SERP inner */}
      <div className="p-4" style={{ background: '#fff', minHeight: 260 }}>
        {/* Google logo + search bar */}
        <div className="flex items-center gap-3 mb-4">
          <span className="font-bold text-lg select-none">
            <span style={{ color: '#4285f4' }}>G</span>
            <span style={{ color: '#ea4335' }}>o</span>
            <span style={{ color: '#fbbc05' }}>o</span>
            <span style={{ color: '#4285f4' }}>g</span>
            <span style={{ color: '#34a853' }}>l</span>
            <span style={{ color: '#ea4335' }}>e</span>
          </span>
          <div
            className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-gray-600 border"
            style={{ borderColor: '#dfe1e5', boxShadow: '0 1px 6px rgba(32,33,36,.08)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-gray-400 shrink-0">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="truncate">{p.query}</span>
          </div>
        </div>

        {/* Result #1 — destaque */}
        <div className="rounded-lg p-3 mb-2 border-2" style={{ borderColor: '#1a73e8', background: '#f8fbff' }}>
          <div className="flex items-center gap-1.5 mb-0.5">
            {/* Favicon placeholder */}
            <div className="w-4 h-4 rounded-sm flex items-center justify-center text-white text-[8px] font-bold shrink-0"
              style={{ background: '#1a73e8' }}>
              {p.name.charAt(0)}
            </div>
            <span className="text-xs font-medium text-gray-700 truncate">{p.name}</span>
            <span className="text-xs text-green-700 ml-auto shrink-0">{p.domain}</span>
          </div>
          <div className="text-sm font-medium text-blue-700 mb-1 leading-snug">{p.name} — {p.segment} Profissional</div>
          <div className="text-xs text-gray-600 leading-snug line-clamp-2">{p.desc}</div>
          {/* Sitelinks */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {p.links.map((l) => (
              <span key={l} className="text-xs text-blue-600 border border-blue-200 rounded px-2 py-0.5 bg-white">
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Result #2 — desbotado */}
        <div className="rounded p-2.5 mb-1.5 opacity-40">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-3.5 h-3.5 rounded-sm bg-gray-400" />
            <span className="text-[10px] text-gray-500">concorrente.com.br</span>
          </div>
          <div className="text-xs text-blue-600 mb-0.5 leading-snug">Resultado Concorrente — {p.segment}</div>
          <div className="text-[10px] text-gray-500 leading-snug">Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod...</div>
        </div>

        {/* Result #3 — ainda mais desbotado */}
        <div className="rounded p-2.5 opacity-20">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-3.5 h-3.5 rounded-sm bg-gray-400" />
            <span className="text-[10px] text-gray-500">outro-concorrente.com</span>
          </div>
          <div className="text-xs text-blue-600 mb-0.5 leading-snug">Outro Resultado — {p.segment} na Região</div>
          <div className="text-[10px] text-gray-500 leading-snug">Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi...</div>
        </div>
      </div>

      {/* Card footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700" style={{ background: '#1a1a1a' }}>
        <span className="text-sm text-gray-400 font-mono">{p.domain}</span>
        <a
          href={`https://${p.domain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium hover:underline"
          style={{ color: '#facc15' }}
        >
          visitar →
        </a>
      </div>
    </div>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function PortfolioPage() {
  return (
    <div style={{ background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
      <Script
        id="ld-portfolio"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MarketingHeader />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 text-center" style={{ background: 'rgb(3,7,18)' }}>
        <div className="max-w-3xl mx-auto px-4">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
            style={{ background: 'rgba(250,204,21,0.12)', color: '#facc15', border: '1px solid rgba(250,204,21,0.25)' }}
          >
            Portfólio
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-5 leading-tight">
            Sites que Criamos para<br />Nossos Clientes
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Cada site que entregamos é desenvolvido do zero, personalizado para o segmento,
            e otimizado para aparecer no Google quando os clientes do nosso cliente pesquisam.
            Veja alguns exemplos. As prévias de busca são ilustrativas e não comprovam posições no Google.
          </p>
        </div>
      </section>

      {/* ── Cases ────────────────────────────────────────────────────────── */}
      <section className="py-16" style={{ background: '#0a0a0a' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {cases.map((p) => (
              <div key={p.domain}>
                <div className="mb-3 text-center">
                  <span className="text-xs font-medium uppercase tracking-widest text-gray-500">{p.segment}</span>
                </div>
                <SerpMockup p={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="py-16" style={{ background: '#0d0d0d' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { number: '50+', label: 'sites entregues' },
              { number: '4,9★', label: 'média de avaliação' },
              { number: '7 dias úteis', label: 'prazo médio' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-8 border border-gray-800" style={{ background: '#111' }}>
                <div className="text-4xl font-extrabold mb-2" style={{ color: '#facc15' }}>{s.number}</div>
                <div className="text-gray-400 text-sm uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 text-center" style={{ background: '#080808' }}>
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Quer um site como esses?</h2>
          <p className="text-lg text-gray-400 mb-10">Criamos o seu em 7 dias úteis por R$197.</p>
          <a
            href={wa()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-lg font-bold transition-transform hover:scale-105"
            style={{ background: '#25d366', color: '#fff' }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Criar meu site agora
          </a>
        </div>
      </section>

      <MarketingFooter />

      {/* Botão flutuante WA */}
      <a
        href={wa()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl"
        style={{ background: '#25d366' }}
      >
        <span className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(37,211,102,0.4)' }} />
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white relative z-10">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </div>
  )
}
