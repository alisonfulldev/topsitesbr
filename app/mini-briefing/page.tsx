'use client'

import { useState } from 'react'
import Image from 'next/image'

// Número que recebe o briefing do lead
const WHATSAPP_ORCAMENTO = '5518998037956'

type MiniBriefing = {
  nome: string
  telefone: string
  oQueVende: string
  conteudoSite: string
  hospedagemDominio: string
  logotipo: string
  objetivo: string
}

const OBJETIVOS = [
  'Vender pelo Google (aparecer nas buscas e atrair clientes)',
  'Apenas ter um site para mostrar meus serviços e passar mais credibilidade',
]

function formatPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function buildMessage(f: MiniBriefing) {
  return [
    '*Mini Briefing — Novo lead*',
    '',
    `*Nome:* ${f.nome.trim()}`,
    `*Telefone:* ${f.telefone}`,
    '',
    `*O que vende:* ${f.oQueVende.trim()}`,
    '',
    `*O que vai aparecer no site:* ${f.conteudoSite.trim()}`,
    '',
    `*Já tem hospedagem e domínio próprio:* ${f.hospedagemDominio}`,
    `*Já tem logotipo:* ${f.logotipo}`,
    `*Objetivo:* ${f.objetivo}`,
    '',
    'Quero começar meu site!',
  ].join('\n')
}

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="block text-sm font-semibold text-gray-800">
        {children}<span className="text-red-500 ml-0.5">*</span>
      </label>
      {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
    </div>
  )
}

const fieldClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors'

function RadioGroup({ name, options, value, onChange }: { name: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className={options.length === 2 && options.every((o) => o.length < 5) ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
      {options.map((opt) => (
        <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${value === opt ? 'border-brand bg-brand/5' : 'border-gray-100 hover:border-gray-200'}`}>
          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${value === opt ? 'border-brand' : 'border-gray-300'}`}>
            {value === opt && <div className="w-2 h-2 rounded-full bg-brand" />}
          </div>
          <span className="text-sm text-gray-700">{opt}</span>
          <input type="radio" name={name} className="sr-only" value={opt} checked={value === opt} onChange={() => onChange(opt)} />
        </label>
      ))}
    </div>
  )
}

export default function MiniBriefingPage() {
  const [started, setStarted] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<MiniBriefing>({
    nome: '', telefone: '', oQueVende: '', conteudoSite: '',
    hospedagemDominio: '', logotipo: '', objetivo: '',
  })

  function set(field: keyof MiniBriefing) {
    return (v: string) => setForm((f) => ({ ...f, [field]: v }))
  }

  function validate(): string | null {
    if (!form.nome.trim()) return 'Informe seu nome.'
    if (form.telefone.replace(/\D/g, '').length < 10) return 'Informe um telefone válido com DDD (ex: (18) 99999-9999).'
    if (!form.oQueVende.trim()) return 'Conte o que você vende ou qual serviço oferece.'
    if (!form.conteudoSite.trim()) return 'Descreva o que vai aparecer no site.'
    if (!form.hospedagemDominio) return 'Responda se já tem hospedagem e domínio próprio.'
    if (!form.logotipo) return 'Responda se já tem logotipo.'
    if (!form.objetivo) return 'Escolha o objetivo do site.'
    return null
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    window.location.href = `https://wa.me/${WHATSAPP_ORCAMENTO}?text=${encodeURIComponent(buildMessage(form))}`
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-gray-950 px-4 py-4 flex items-center justify-center">
        <Image src="/logo.png" alt="TOP SITE" width={100} height={30} className="h-7 w-auto" priority />
      </header>

      <div className="max-w-xl mx-auto px-4 py-8">
        {!started ? (
          /* ── Tela inicial ── */
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand/15 flex items-center justify-center text-2xl mb-4">📝</div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mini briefing do seu site</h1>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
              São só <strong>7 perguntas rápidas</strong>. Com essas respostas nossa equipe entende o seu negócio
              e já começa a planejar o <strong>seu site</strong>.
            </p>

            <div className="mt-6 text-left bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-900">Preencha com atenção</p>
              <ul className="mt-2 space-y-1.5 text-sm text-amber-900/90">
                <li>• Quanto mais detalhes você der, mais o site fica com a cara do seu negócio.</li>
                <li>• Confira seu telefone — é por ele que vamos falar com você.</li>
                <li>• Ao enviar, você será levado ao WhatsApp com as respostas prontas. É só tocar em enviar lá.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => { setStarted(true); window.scrollTo({ top: 0 }) }}
              className="mt-6 w-full bg-brand text-brand-dark font-bold py-3.5 rounded-xl text-sm hover:bg-brand/90 transition-colors"
            >
              Começar briefing →
            </button>
            <p className="text-xs text-gray-400 mt-3">Leva menos de 2 minutos.</p>
          </div>
        ) : (
          /* ── Formulário ── */
          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <div>
                <Label>Seu nome</Label>
                <input type="text" value={form.nome} onChange={(e) => set('nome')(e.target.value)} placeholder="Ex: João Silva" autoComplete="name" className={fieldClass} />
              </div>

              <div>
                <Label>Telefone / WhatsApp</Label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={form.telefone}
                  onChange={(e) => set('telefone')(formatPhone(e.target.value))}
                  placeholder="(18) 99999-9999"
                  maxLength={16}
                  autoComplete="tel"
                  className={fieldClass}
                />
              </div>

              <div>
                <Label hint="Seus produtos ou serviços principais.">O que você vende?</Label>
                <textarea value={form.oQueVende} onChange={(e) => set('oQueVende')(e.target.value)} rows={3} placeholder="Ex: Sou eletricista, faço instalações residenciais e comerciais" className={`${fieldClass} resize-none`} />
              </div>

              <div>
                <Label hint="Seções, informações, fotos, contato, endereço...">O que vai aparecer no site?</Label>
                <textarea value={form.conteudoSite} onChange={(e) => set('conteudoSite')(e.target.value)} rows={4} placeholder="Ex: Quem sou, lista de serviços, fotos de trabalhos, depoimentos, botão do WhatsApp e endereço" className={`${fieldClass} resize-none`} />
              </div>

              <div>
                <Label>Já tem hospedagem e domínio próprio?</Label>
                <RadioGroup name="hospedagemDominio" options={['Sim', 'Não']} value={form.hospedagemDominio} onChange={set('hospedagemDominio')} />
              </div>

              <div>
                <Label>Já tem logotipo?</Label>
                <RadioGroup name="logotipo" options={['Sim', 'Não']} value={form.logotipo} onChange={set('logotipo')} />
              </div>

              <div>
                <Label>Qual o objetivo do site?</Label>
                <RadioGroup name="objetivo" options={OBJETIVOS} value={form.objetivo} onChange={set('objetivo')} />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="cta-pulse mt-5 w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-4 rounded-xl text-base hover:bg-[#1ebe5b] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43zm8.03-17.46A11.28 11.28 0 0 0 12.04.72C5.79.72.7 5.8.7 12.06c0 2 .52 3.95 1.52 5.67L.6 23.28l5.69-1.49a11.3 11.3 0 0 0 5.75 1.47h.01c6.25 0 11.34-5.09 11.34-11.34 0-3.03-1.18-5.88-3.31-8.02z" />
              </svg>
              Enviar briefing pelo WhatsApp
            </button>

            <button
              type="button"
              onClick={() => setStarted(false)}
              className="mt-3 w-full py-3 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Voltar
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
