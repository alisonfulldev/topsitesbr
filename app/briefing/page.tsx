'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { sendBriefing, type BriefingData } from './actions'

const TOTAL_STEPS = 5

const STEP_TITLES = [
  'Informações da Empresa',
  'Objetivos do Site',
  'Conteúdo e Recursos',
  'Design e Referências',
  'Informações Técnicas',
]

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors resize-none"
    />
  )
}

function RadioGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${value === opt ? 'border-brand bg-brand/5' : 'border-gray-100 hover:border-gray-200'}`}>
          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${value === opt ? 'border-brand' : 'border-gray-300'}`}>
            {value === opt && <div className="w-2 h-2 rounded-full bg-brand" />}
          </div>
          <span className="text-sm text-gray-700">{opt}</span>
          <input type="radio" className="sr-only" value={opt} checked={value === opt} onChange={() => onChange(opt)} />
        </label>
      ))}
    </div>
  )
}

export default function BriefingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const [form, setForm] = useState<BriefingData>({
    nomeEmpresa: '', areaAtuacao: '', endereco: '', descricao: '',
    objetivo: '', publicoAlvo: '', mensagemPrincipal: '',
    produtosServicos: '', possuiFotos: '', depoimentos: '', redesSociais: '',
    estiloDesign: '', coresPrincipais: '', exemplosSites: '',
    formularioContato: '', integracaoWhatsapp: '', observacoes: '',
  })

  function set(field: keyof BriefingData) {
    return (v: string) => setForm((f) => ({ ...f, [field]: v }))
  }

  function validateStep(): string | null {
    if (step === 1) {
      if (!form.nomeEmpresa.trim()) return 'Informe o nome da empresa.'
      if (!form.areaAtuacao.trim()) return 'Informe a área de atuação.'
      if (!form.endereco.trim()) return 'Informe o endereço.'
      if (!form.descricao.trim()) return 'Descreva brevemente a empresa.'
    }
    if (step === 2) {
      if (!form.objetivo) return 'Selecione o principal objetivo.'
      if (!form.publicoAlvo.trim()) return 'Descreva o público-alvo.'
      if (!form.mensagemPrincipal.trim()) return 'Informe a mensagem principal.'
    }
    if (step === 3) {
      if (!form.produtosServicos.trim()) return 'Informe os produtos/serviços em destaque.'
      if (!form.possuiFotos) return 'Responda sobre fotos/imagens.'
      if (!form.depoimentos) return 'Responda sobre depoimentos/cases.'
      if (!form.redesSociais.trim()) return 'Informe suas redes sociais ou outros sites.'
    }
    if (step === 4) {
      if (!form.estiloDesign) return 'Selecione o estilo de design preferido.'
      if (!form.coresPrincipais.trim()) return 'Informe as cores principais.'
    }
    if (step === 5) {
      if (!form.formularioContato) return 'Responda sobre formulário de contato.'
      if (!form.integracaoWhatsapp) return 'Responda sobre integração com WhatsApp.'
      if (!form.observacoes.trim()) return 'Informe outras observações (ou escreva "Nenhuma").'
    }
    return null
  }

  function handleNext() {
    const err = validateStep()
    if (err) { setError(err); return }
    setError('')
    setStep((s) => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleBack() {
    setError('')
    setStep((s) => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSubmit() {
    const err = validateStep()
    if (err) { setError(err); return }
    setError('')
    startTransition(async () => {
      const res = await sendBriefing(form)
      if (!res.ok) { setError(res.error ?? 'Erro ao enviar.'); return }
      router.push('/briefing/obrigado')
    })
  }

  const pct = Math.round((step / TOTAL_STEPS) * 100)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-950 px-4 py-4 flex items-center justify-center">
        <Image src="/logo.png" alt="TOP SITE" width={100} height={30} className="h-7 w-auto" priority />
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Etapa {step} de {TOTAL_STEPS} — {STEP_TITLES[step - 1]}
            </p>
            <p className="text-xs font-bold text-brand">{pct}%</p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-brand transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">

          {/* ── Step 1 ── */}
          {step === 1 && (
            <>
              <div>
                <Label required>Nome da empresa</Label>
                <Input value={form.nomeEmpresa} onChange={set('nomeEmpresa')} placeholder="Ex: Clínica Sorriso Perfeito" />
              </div>
              <div>
                <Label required>Área de atuação</Label>
                <Input value={form.areaAtuacao} onChange={set('areaAtuacao')} placeholder="Ex: Odontologia, Advocacia, Construção civil..." />
              </div>
              <div>
                <Label required>Endereço da empresa</Label>
                <Input value={form.endereco} onChange={set('endereco')} placeholder="Rua, número, bairro, cidade - UF" />
              </div>
              <div>
                <Label required>Breve descrição da empresa</Label>
                <Textarea value={form.descricao} onChange={set('descricao')} placeholder="O que sua empresa faz, há quanto tempo existe, diferenciais..." rows={4} />
              </div>
            </>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <>
              <div>
                <Label required>Principal objetivo do site</Label>
                <RadioGroup
                  value={form.objetivo}
                  onChange={set('objetivo')}
                  options={['Captar leads', 'Apresentar produtos e serviços', 'Mostrar portfólio ou cases', 'Outro']}
                />
              </div>
              <div>
                <Label required>Público-alvo principal</Label>
                <Input value={form.publicoAlvo} onChange={set('publicoAlvo')} placeholder="Ex: Mulheres 30-50 anos na região central" />
              </div>
              <div>
                <Label required>Mensagem principal que deseja passar</Label>
                <Textarea value={form.mensagemPrincipal} onChange={set('mensagemPrincipal')} placeholder="Ex: Somos referência em qualidade e atendimento personalizado" />
              </div>
            </>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <>
              <div>
                <Label required>Produtos/Serviços que deseja destacar</Label>
                <Textarea value={form.produtosServicos} onChange={set('produtosServicos')} placeholder="Liste os principais produtos ou serviços que devem aparecer no site" rows={4} />
              </div>
              <div>
                <Label required>Possui fotos/imagens?</Label>
                <RadioGroup
                  value={form.possuiFotos}
                  onChange={set('possuiFotos')}
                  options={['Sim, tenho fotos para enviar', 'Não tenho — descreva o produto/serviço para buscarmos na internet', 'Outro']}
                />
              </div>
              <div>
                <Label required>Deseja incluir depoimentos ou cases?</Label>
                <RadioGroup
                  value={form.depoimentos}
                  onChange={set('depoimentos')}
                  options={['Sim', 'Não']}
                />
              </div>
              <div>
                <Label required>Links de redes sociais ou outros sites</Label>
                <Textarea value={form.redesSociais} onChange={set('redesSociais')} placeholder="Instagram, Facebook, site atual, LinkedIn..." />
              </div>
            </>
          )}

          {/* ── Step 4 ── */}
          {step === 4 && (
            <>
              <div>
                <Label required>Estilo de design preferido</Label>
                <RadioGroup
                  value={form.estiloDesign}
                  onChange={set('estiloDesign')}
                  options={['Moderno e tecnológico', 'Tradicional e Institucional', 'Colorido e Chamativo', 'Minimalista', 'Outro']}
                />
              </div>
              <div>
                <Label required>Cores principais</Label>
                <Input value={form.coresPrincipais} onChange={set('coresPrincipais')} placeholder="Ex: azul escuro, branco e dourado" />
              </div>
              <div>
                <Label>Exemplos de sites que gosta <span className="text-gray-400 font-normal">(opcional)</span></Label>
                <Textarea value={form.exemplosSites} onChange={set('exemplosSites')} placeholder="Cole links de sites cujo design você aprecia" />
              </div>
            </>
          )}

          {/* ── Step 5 ── */}
          {step === 5 && (
            <>
              <div>
                <Label required>Deseja formulário de contato no site?</Label>
                <RadioGroup
                  value={form.formularioContato}
                  onChange={set('formularioContato')}
                  options={['Sim', 'Não']}
                />
              </div>
              <div>
                <Label required>Deseja integração com WhatsApp ou outro canal?</Label>
                <RadioGroup
                  value={form.integracaoWhatsapp}
                  onChange={set('integracaoWhatsapp')}
                  options={['Sim', 'Não']}
                />
              </div>
              <div>
                <Label required>Outras observações importantes</Label>
                <Textarea value={form.observacoes} onChange={set('observacoes')} placeholder="Qualquer informação adicional que considere relevante para o seu site" rows={4} />
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-5">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ← Voltar
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-brand text-brand-dark font-bold py-3.5 rounded-xl text-sm hover:bg-brand/90 transition-colors"
            >
              Próximo →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={pending}
              className="flex-1 bg-brand text-brand-dark font-bold py-3.5 rounded-xl text-sm hover:bg-brand/90 transition-colors disabled:opacity-50"
            >
              {pending ? 'Enviando...' : 'Enviar briefing ✓'}
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Suas informações são enviadas com segurança diretamente para nossa equipe.
        </p>
      </div>
    </main>
  )
}
