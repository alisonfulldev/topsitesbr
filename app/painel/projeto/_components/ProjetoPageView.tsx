'use client'

import { useState, useTransition } from 'react'
import { approveSiteAction, requestRevisionAction, submitBriefingAction } from '../actions'
import { COMPANY_WHATSAPP } from '@/lib/config'

type ProposalStatus =
  | 'aprovada'
  | 'paga'
  | 'aguardando_info'
  | 'em_desenvolvimento'
  | 'pronto_revisao'
  | 'publicado'

type BriefingData = {
  data: Record<string, unknown>
  submittedAt: Date
}

type ProposalData = {
  id: string
  title: string
  status: ProposalStatus
  previewUrl: string | null
  revisionUsed: boolean
  siteApprovedAt: Date | null
  paidAt: Date | null
  contractAcceptedAt: Date | null
  contractVersion: string | null
  briefing: BriefingData | null
}

const STEPS = [
  {
    key: 'paga',
    label: 'Pagamento confirmado',
    description: 'O pagamento foi recebido e seu projeto foi iniciado.',
  },
  {
    key: 'aguardando_info',
    label: 'Informações do Site',
    description: 'Preencha as informações do seu site para iniciarmos o desenvolvimento.',
  },
  {
    key: 'em_desenvolvimento',
    label: 'Em desenvolvimento',
    description: 'Nossa equipe está construindo o seu site.',
  },
  {
    key: 'pronto_revisao',
    label: 'Pronto para revisão',
    description: 'O site está pronto! Revise e nos diga o que achar.',
  },
  {
    key: 'publicado',
    label: 'Publicado',
    description: 'Seu site está no ar!',
  },
]

const STATUS_ORDER: Record<ProposalStatus, number> = {
  aprovada: -1,
  paga: 0,
  aguardando_info: 1,
  em_desenvolvimento: 2,
  pronto_revisao: 3,
  publicado: 4,
}

// ── Briefing form types ──────────────────────────────────────────────────────

type FormData = {
  companyName: string
  industry: string
  companyDescription: string
  mission: string
  goals: string[]
  goalsOther: string
  targetAudience: string
  regions: string
  services: string
  highlightedService: string
  hasTexts: 'sim' | 'nao'
  texts: string
  hasLogo: 'sim' | 'nao'
  brandColors: string
  contactWhatsapp: string
  contactPhone: string
  contactEmail: string
  contactAddress: string
  contactHours: string
  contactSocial: string
  features: string[]
  featuresOther: string
  sitesLike: string
  sitesDislike: string
  finalNotes: string
}

const GOAL_OPTIONS = ['Gerar vendas', 'Captar clientes', 'Apresentar a empresa', 'Agendamentos']
const FEATURE_OPTIONS = ['Formulário de contato', 'Botão do WhatsApp', 'Mapa', 'Agendamento', 'Área do cliente', 'Catálogo de produtos']

const INPUT = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent'
const TEXTAREA = `${INPUT} resize-none`
const SECTION_TITLE = 'text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'

function BriefingReadOnly({ briefing, proposalTitle, clientName }: { briefing: BriefingData; proposalTitle: string; clientName?: string }) {
  const d = briefing.data as Record<string, string | string[]>
  const whatsappMsg = encodeURIComponent(`Olá! Segue as fotos e o logotipo do meu site. (Cliente: ${clientName ?? ''}, projeto: ${proposalTitle})`)
  const whatsappUrl = `https://wa.me/${COMPANY_WHATSAPP}?text=${whatsappMsg}`

  const rows: [string, string | undefined][] = [
    ['Nome da empresa', d.companyName as string],
    ['Ramo de atuação', d.industry as string],
    ['Sobre a empresa', d.companyDescription as string],
    ['Missão / objetivo', d.mission as string],
    ['Objetivos do site', Array.isArray(d.goals) ? (d.goals as string[]).join(', ') : undefined],
    ['Outro objetivo', d.goalsOther as string],
    ['Público-alvo', d.targetAudience as string],
    ['Regiões que atende', d.regions as string],
    ['Serviços / produtos', d.services as string],
    ['Serviço em destaque', d.highlightedService as string],
    ['Possui textos prontos?', d.hasTexts === 'sim' ? 'Sim' : 'Não'],
    ['Textos prontos', d.texts as string],
    ['Possui logotipo?', d.hasLogo === 'sim' ? 'Sim' : 'Não'],
    ['Cores da marca', d.brandColors as string],
    ['WhatsApp', d.contactWhatsapp as string],
    ['Telefone', d.contactPhone as string],
    ['E-mail', d.contactEmail as string],
    ['Endereço', d.contactAddress as string],
    ['Horário de atendimento', d.contactHours as string],
    ['Redes sociais', d.contactSocial as string],
    ['Funcionalidades', Array.isArray(d.features) ? (d.features as string[]).join(', ') : undefined],
    ['Outra funcionalidade', d.featuresOther as string],
    ['Sites que gosta', d.sitesLike as string],
    ['Sites que não gosta', d.sitesDislike as string],
    ['Observações finais', d.finalNotes as string],
  ]

  return (
    <div className="mt-4 space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-green-800 mb-0.5">Informações enviadas ✓</p>
        <p className="text-xs text-green-700">
          Enviado em {briefing.submittedAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-amber-800 mb-1">📷 Fotos e logotipo</p>
        <p className="text-xs text-amber-700 mb-3">Lembre-se de enviar as fotos e o logotipo pelo WhatsApp para garantirmos a qualidade visual do seu site.</p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Enviar fotos pelo WhatsApp
        </a>
      </div>

      <div className="space-y-2">
        {rows.filter(([, v]) => v).map(([label, value]) => (
          <div key={label} className="flex gap-2">
            <span className="text-xs text-gray-500 shrink-0 w-40">{label}:</span>
            <span className="text-xs text-gray-900 whitespace-pre-wrap">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BriefingModal({
  proposal,
  clientName,
  onClose,
  onSuccess,
}: {
  proposal: ProposalData
  clientName?: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormData>({
    companyName: '',
    industry: '',
    companyDescription: '',
    mission: '',
    goals: [],
    goalsOther: '',
    targetAudience: '',
    regions: '',
    services: '',
    highlightedService: '',
    hasTexts: 'nao',
    texts: '',
    hasLogo: 'nao',
    brandColors: '',
    contactWhatsapp: '',
    contactPhone: '',
    contactEmail: '',
    contactAddress: '',
    contactHours: '',
    contactSocial: '',
    features: [],
    featuresOther: '',
    sitesLike: '',
    sitesDislike: '',
    finalNotes: '',
  })

  function toggleGoal(g: string) {
    setForm((f) => ({
      ...f,
      goals: f.goals.includes(g) ? f.goals.filter((x) => x !== g) : [...f.goals, g],
    }))
  }

  function toggleFeature(f: string) {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(f) ? prev.features.filter((x) => x !== f) : [...prev.features, f],
    }))
  }

  const whatsappMsg = encodeURIComponent(`Olá! Segue as fotos e o logotipo do meu site. (Cliente: ${clientName ?? ''}, projeto: ${proposal.title})`)
  const whatsappUrl = `https://wa.me/${COMPANY_WHATSAPP}?text=${whatsappMsg}`

  function handleSubmit() {
    setError('')
    if (!form.companyName.trim()) { setError('Informe o nome da empresa.'); return }
    if (!form.industry.trim()) { setError('Informe o ramo de atuação.'); return }
    if (form.goals.length === 0 && !form.goalsOther.trim()) { setError('Selecione ao menos um objetivo do site.'); return }
    if (!form.services.trim()) { setError('Informe os serviços ou produtos a apresentar.'); return }
    if (!form.contactWhatsapp.trim()) { setError('Informe o WhatsApp de contato do site.'); return }

    startTransition(async () => {
      const res = await submitBriefingAction(proposal.id, form as unknown as Record<string, unknown>)
      if (res.error) {
        setError(res.error)
      } else {
        onSuccess()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-4 px-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Informações do Site</h2>
            <p className="text-xs text-gray-500 mt-0.5">Essas informações são essenciais para criarmos o seu site.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto max-h-[70vh]">

          {/* 1. Sobre a empresa */}
          <div>
            <p className={SECTION_TITLE}>1. Sobre a Empresa</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nome da empresa <span className="text-red-500">*</span></label>
                <input type="text" value={form.companyName} onChange={e => setForm(f => ({...f, companyName: e.target.value}))} placeholder="Nome da empresa" className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ramo de atuação <span className="text-red-500">*</span></label>
                <input type="text" value={form.industry} onChange={e => setForm(f => ({...f, industry: e.target.value}))} placeholder="Ex: Clínica odontológica, Pet shop, Advocacia..." className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Conte um pouco sobre a empresa</label>
                <textarea value={form.companyDescription} onChange={e => setForm(f => ({...f, companyDescription: e.target.value}))} placeholder="O que a empresa faz, há quanto tempo existe, diferenciais..." rows={3} className={TEXTAREA} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Missão ou principal objetivo</label>
                <textarea value={form.mission} onChange={e => setForm(f => ({...f, mission: e.target.value}))} placeholder="Ex: Oferecer o melhor atendimento odontológico da região..." rows={2} className={TEXTAREA} />
              </div>
            </div>
          </div>

          {/* 2. Objetivo do site */}
          <div>
            <p className={SECTION_TITLE}>2. Objetivo do Site <span className="text-red-500 normal-case text-xs font-normal">*</span></p>
            <div className="space-y-2">
              {GOAL_OPTIONS.map(g => (
                <label key={g} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.goals.includes(g)} onChange={() => toggleGoal(g)} className="rounded border-gray-300 text-brand-text focus:ring-brand" />
                  <span className="text-sm text-gray-700">{g}</span>
                </label>
              ))}
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={!!form.goalsOther} readOnly className="rounded border-gray-300 text-brand-text" />
                <input type="text" value={form.goalsOther} onChange={e => setForm(f => ({...f, goalsOther: e.target.value}))} placeholder="Outro..." className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>
            </div>
          </div>

          {/* 3. Público-alvo */}
          <div>
            <p className={SECTION_TITLE}>3. Público-alvo</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Quem é o seu público-alvo?</label>
                <textarea value={form.targetAudience} onChange={e => setForm(f => ({...f, targetAudience: e.target.value}))} placeholder="Ex: Adultos entre 25 e 50 anos que buscam tratamento odontológico..." rows={2} className={TEXTAREA} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cidades ou regiões que atende</label>
                <input type="text" value={form.regions} onChange={e => setForm(f => ({...f, regions: e.target.value}))} placeholder="Ex: São Paulo, ABC Paulista..." className={INPUT} />
              </div>
            </div>
          </div>

          {/* 4. Conteúdo */}
          <div>
            <p className={SECTION_TITLE}>4. Conteúdo</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Serviços ou produtos a apresentar <span className="text-red-500">*</span></label>
                <textarea value={form.services} onChange={e => setForm(f => ({...f, services: e.target.value}))} placeholder="Ex: Limpeza dental, clareamento, aparelho..." rows={3} className={TEXTAREA} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Algum serviço que deve receber destaque?</label>
                <input type="text" value={form.highlightedService} onChange={e => setForm(f => ({...f, highlightedService: e.target.value}))} placeholder="Ex: Clareamento dental a laser" className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Possui textos prontos?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="hasTexts" checked={form.hasTexts === 'sim'} onChange={() => setForm(f => ({...f, hasTexts: 'sim'}))} className="text-brand-text focus:ring-brand" />
                    <span className="text-sm text-gray-700">Sim</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="hasTexts" checked={form.hasTexts === 'nao'} onChange={() => setForm(f => ({...f, hasTexts: 'nao'}))} className="text-brand-text focus:ring-brand" />
                    <span className="text-sm text-gray-700">Não</span>
                  </label>
                </div>
                {form.hasTexts === 'sim' && (
                  <textarea value={form.texts} onChange={e => setForm(f => ({...f, texts: e.target.value}))} placeholder="Cole aqui os textos prontos..." rows={4} className={`${TEXTAREA} mt-2`} />
                )}
              </div>

              {/* Photos notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-800 mb-1">📷 Fotos e logotipo</p>
                <p className="text-xs text-amber-700 mb-3">
                  As fotos e o logotipo devem ser enviados pelo nosso WhatsApp. Toque no botão abaixo para enviar agora.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Enviar fotos pelo WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* 5. Identidade visual */}
          <div>
            <p className={SECTION_TITLE}>5. Identidade Visual</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Já possui logotipo?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="hasLogo" checked={form.hasLogo === 'sim'} onChange={() => setForm(f => ({...f, hasLogo: 'sim'}))} className="text-brand-text focus:ring-brand" />
                    <span className="text-sm text-gray-700">Sim</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="hasLogo" checked={form.hasLogo === 'nao'} onChange={() => setForm(f => ({...f, hasLogo: 'nao'}))} className="text-brand-text focus:ring-brand" />
                    <span className="text-sm text-gray-700">Não</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cores da marca</label>
                <input type="text" value={form.brandColors} onChange={e => setForm(f => ({...f, brandColors: e.target.value}))} placeholder="Ex: Azul e branco, verde esmeralda..." className={INPUT} />
              </div>
            </div>
          </div>

          {/* 6. Contato */}
          <div>
            <p className={SECTION_TITLE}>6. Informações de Contato</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp <span className="text-red-500">*</span></label>
                <input type="text" value={form.contactWhatsapp} onChange={e => setForm(f => ({...f, contactWhatsapp: e.target.value}))} placeholder="(00) 90000-0000" className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Telefone</label>
                <input type="text" value={form.contactPhone} onChange={e => setForm(f => ({...f, contactPhone: e.target.value}))} placeholder="(00) 0000-0000" className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">E-mail</label>
                <input type="email" value={form.contactEmail} onChange={e => setForm(f => ({...f, contactEmail: e.target.value}))} placeholder="contato@empresa.com.br" className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Endereço</label>
                <input type="text" value={form.contactAddress} onChange={e => setForm(f => ({...f, contactAddress: e.target.value}))} placeholder="Rua, número, bairro, cidade..." className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Horário de atendimento</label>
                <input type="text" value={form.contactHours} onChange={e => setForm(f => ({...f, contactHours: e.target.value}))} placeholder="Ex: Seg–Sex 9h às 18h" className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Redes sociais</label>
                <input type="text" value={form.contactSocial} onChange={e => setForm(f => ({...f, contactSocial: e.target.value}))} placeholder="Instagram, Facebook, LinkedIn..." className={INPUT} />
              </div>
            </div>
          </div>

          {/* 7. Funcionalidades */}
          <div>
            <p className={SECTION_TITLE}>7. Funcionalidades</p>
            <div className="space-y-2">
              {FEATURE_OPTIONS.map(feat => (
                <label key={feat} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.features.includes(feat)} onChange={() => toggleFeature(feat)} className="rounded border-gray-300 text-brand-text focus:ring-brand" />
                  <span className="text-sm text-gray-700">{feat}</span>
                </label>
              ))}
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={!!form.featuresOther} readOnly className="rounded border-gray-300 text-brand-text" />
                <input type="text" value={form.featuresOther} onChange={e => setForm(f => ({...f, featuresOther: e.target.value}))} placeholder="Outro..." className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>
            </div>
          </div>

          {/* 8. Referências */}
          <div>
            <p className={SECTION_TITLE}>8. Referências</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Algum site que você goste? Quais?</label>
                <textarea value={form.sitesLike} onChange={e => setForm(f => ({...f, sitesLike: e.target.value}))} placeholder="Links ou descrição de sites que você acha bonitos e bem feitos..." rows={2} className={TEXTAREA} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Algum site que você não goste?</label>
                <textarea value={form.sitesDislike} onChange={e => setForm(f => ({...f, sitesDislike: e.target.value}))} placeholder="O que você não gosta no visual ou na experiência?" rows={2} className={TEXTAREA} />
              </div>
            </div>
          </div>

          {/* 9. Observações */}
          <div>
            <p className={SECTION_TITLE}>9. Observações Finais</p>
            <textarea value={form.finalNotes} onChange={e => setForm(f => ({...f, finalNotes: e.target.value}))} placeholder="Alguma informação importante que não foi contemplada acima?" rows={3} className={TEXTAREA} />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
            Fechar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-5 py-2 text-sm bg-brand text-brand-dark font-semibold rounded-lg hover:bg-brand-hover disabled:opacity-50"
          >
            {isPending ? 'Enviando…' : 'Enviar informações'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface Props {
  proposal: ProposalData
  clientName?: string
}

export function ProjetoPageView({ proposal, clientName }: Props) {
  const [isPending, startTransition] = useTransition()
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRevisionModal, setShowRevisionModal] = useState(false)
  const [showBriefingModal, setShowBriefingModal] = useState(false)
  const [revisionNotes, setRevisionNotes] = useState('')
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null)
  const [briefingSubmitted, setBriefingSubmitted] = useState(!!proposal.briefing)

  // Pagamento ainda não confirmado — aguarda webhook do Asaas
  if (proposal.status === 'aprovada') {
    return (
      <div className="max-w-xl">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Meu Projeto</h1>
        <p className="text-sm text-gray-500 mb-6">{proposal.title}</p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center">
          <div className="text-3xl mb-3">⏳</div>
          <p className="text-sm font-semibold text-yellow-800 mb-1">Aguardando confirmação do pagamento</p>
          <p className="text-xs text-yellow-700">
            Assim que o pagamento for confirmado, o projeto entra em desenvolvimento automaticamente e você será notificado aqui.
          </p>
        </div>
      </div>
    )
  }

  const currentStepIdx = STATUS_ORDER[proposal.status]

  function handleApprove() {
    startTransition(async () => {
      const res = await approveSiteAction(proposal.id)
      setResult(res)
      if (res.success) setShowApproveModal(false)
    })
  }

  function handleRequestRevision() {
    startTransition(async () => {
      const res = await requestRevisionAction(proposal.id, revisionNotes)
      setResult(res)
      if (res.success) {
        setShowRevisionModal(false)
        setRevisionNotes('')
      }
    })
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Meu Projeto</h1>
      <p className="text-sm text-gray-500 mb-6">{proposal.title}</p>

      {/* Timeline */}
      <div className="relative mb-8">
        {STEPS.map((step, idx) => {
          const done = currentStepIdx > idx
          const active = currentStepIdx === idx
          const upcoming = currentStepIdx < idx

          return (
            <div key={step.key} className="flex gap-4 pb-6 last:pb-0">
              {/* Line + dot column */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
                    done
                      ? 'bg-green-500 border-green-500'
                      : active
                        ? 'bg-brand border-brand'
                        : 'bg-white border-gray-300'
                  }`}
                >
                  {done ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : active ? (
                    <div className="w-3 h-3 rounded-full bg-brand-dark" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                  )}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`w-0.5 flex-1 mt-1 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>

              {/* Content */}
              <div className="pt-1 pb-2 flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold ${
                    done ? 'text-green-700' : active ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                {!upcoming && (
                  <p className={`text-xs mt-0.5 ${done ? 'text-gray-400' : 'text-gray-500'}`}>
                    {step.description}
                  </p>
                )}

                {/* Briefing step */}
                {step.key === 'aguardando_info' && active && (
                  <div className="mt-4">
                    {briefingSubmitted && proposal.briefing ? (
                      <BriefingReadOnly briefing={proposal.briefing} proposalTitle={proposal.title} clientName={clientName} />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowBriefingModal(true)}
                        className="w-full py-3 bg-brand text-brand-dark text-sm font-semibold rounded-xl hover:bg-brand-hover transition-colors"
                      >
                        Preencher as informações do meu site →
                      </button>
                    )}
                  </div>
                )}

                {/* Show read-only briefing when step is done */}
                {step.key === 'aguardando_info' && done && proposal.briefing && (
                  <BriefingReadOnly briefing={proposal.briefing} proposalTitle={proposal.title} clientName={clientName} />
                )}

                {/* Revision section */}
                {step.key === 'pronto_revisao' && active && (
                  <div className="mt-4 space-y-3">
                    {proposal.previewUrl && (
                      <a
                        href={proposal.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-brand-text hover:underline font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Ver prévia do site →
                      </a>
                    )}

                    {proposal.siteApprovedAt ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800 font-medium">
                          Aprovação enviada — aguardando publicação
                        </p>
                        <p className="text-xs text-green-600 mt-0.5">
                          Aprovado em {proposal.siteApprovedAt.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    ) : result?.success ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800 font-medium">Solicitação enviada!</p>
                      </div>
                    ) : (
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setShowApproveModal(true)}
                          className="px-4 py-2 bg-brand text-brand-dark text-sm font-semibold rounded-lg hover:bg-brand-hover"
                        >
                          Aprovar site
                        </button>
                        {!proposal.revisionUsed && (
                          <button
                            type="button"
                            onClick={() => setShowRevisionModal(true)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                          >
                            Solicitar ajustes
                          </button>
                        )}
                        {proposal.revisionUsed && (
                          <p className="text-xs text-gray-400 self-center">
                            Revisão já utilizada nesta proposta.
                          </p>
                        )}
                      </div>
                    )}

                    {result?.error && (
                      <p className="text-xs text-red-600">{result.error}</p>
                    )}
                  </div>
                )}

                {/* Published */}
                {step.key === 'publicado' && active && (
                  <div className="mt-3 space-y-3">
                    <div className="bg-brand-50 border border-brand-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-brand-text">
                        Seu site está no ar!
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Ative o plano mensal para manter seu site publicado com hospedagem, SSL e suporte.
                      </p>
                    </div>
                    <a
                      href="/painel"
                      className="block w-full text-center py-3 bg-brand text-brand-dark font-semibold rounded-xl hover:bg-brand-hover transition-colors text-sm"
                    >
                      Ativar plano e manter site no ar →
                    </a>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Contrato assinado */}
      {proposal.contractAcceptedAt && (
        <div className="mt-2 border border-gray-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 mb-0.5">Contrato assinado</p>
          <p className="text-xs text-gray-400">
            Aceito em{' '}
            {proposal.contractAcceptedAt.toLocaleString('pt-BR', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
            {proposal.contractVersion ? ` — versão ${proposal.contractVersion}` : ''}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            A cópia foi enviada para o seu e-mail no momento do aceite.
          </p>
        </div>
      )}

      {/* Briefing modal */}
      {showBriefingModal && (
        <BriefingModal
          proposal={proposal}
          clientName={clientName}
          onClose={() => setShowBriefingModal(false)}
          onSuccess={() => {
            setShowBriefingModal(false)
            setBriefingSubmitted(true)
          }}
        />
      )}

      {/* Approve modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Confirmar aprovação</h2>
            <p className="text-sm text-gray-600 mb-6">
              Ao aprovar, confirma que o site está do jeito que você quer. Nossa equipe irá publicá-lo em seguida.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isPending}
                className="px-4 py-2 text-sm bg-brand text-brand-dark font-semibold rounded-lg hover:bg-brand-hover disabled:opacity-50"
              >
                {isPending ? 'Enviando…' : 'Sim, aprovar site'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Solicitar ajustes</h2>
            <p className="text-sm text-gray-600 mb-4">
              Descreva o que precisa ser ajustado. Você tem direito a uma revisão nesta proposta.
            </p>
            <textarea
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Ex: Mudar a cor do botão para azul, trocar a foto do banner..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand mb-4 resize-none"
            />
            {result?.error && (
              <p className="text-xs text-red-600 mb-3">{result.error}</p>
            )}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setShowRevisionModal(false); setResult(null) }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRequestRevision}
                disabled={isPending || !revisionNotes.trim()}
                className="px-4 py-2 text-sm bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {isPending ? 'Enviando…' : 'Enviar solicitação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
