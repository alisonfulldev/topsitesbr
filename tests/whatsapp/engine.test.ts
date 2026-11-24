import { createHmac } from 'crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Decision, Task } from '@/lib/whatsapp/ai'
import { client } from '../helpers/factories'

// IA e API do WhatsApp simuladas: nada sai para fora nos testes
const decideMock = vi.fn<(...args: unknown[]) => Promise<Decision>>()
vi.mock('@/lib/whatsapp/ai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/whatsapp/ai')>()),
  aiConfigured: () => true,
  decide: (...args: unknown[]) => decideMock(...args),
}))
const sendText = vi.fn(async (_to: string, _body: string) => 'wamid.out.' + Math.random().toString(36).slice(2))
const sendTemplate = vi.fn(async (_to: string, _name: string, _lang: string, _params: string[]) => 'wamid.tpl.' + Math.random().toString(36).slice(2))
vi.mock('@/lib/whatsapp/cloud-api', () => ({
  sendText: (to: string, body: string) => sendText(to, body),
  sendTemplate: (to: string, name: string, lang: string, params: string[]) => sendTemplate(to, name, lang, params),
  requestSync: vi.fn(),
  whatsappConfigured: () => true,
}))

const { handleWhatsappWebhook } = await import('@/lib/whatsapp/webhook')
const { runWhatsappAi } = await import('@/lib/whatsapp/engine')
const { saveWaConfig, DEFAULT_WA_CONFIG } = await import('@/lib/whatsapp/config')
const { POST } = await import('@/app/api/webhooks/whatsapp/route')

// Terça-feira, 12h em São Paulo (dentro da janela de envio)
const NOW = new Date('2026-11-24T15:00:00Z')
const ago = (ms: number) => new Date(NOW.getTime() - ms)
const MIN = 60_000
const HOUR = 60 * MIN
const ts = (d: Date) => String(Math.floor(d.getTime() / 1000))

const decision = (over: Partial<Decision> = {}): Decision => ({
  categoria: 'lead', resumo: 'Quer um site para a barbearia', interesse: 'mini site', acao: 'enviar',
  mensagem: 'Oi! Faço sim, sites para barbearia. Quer ver uns modelos?', parametros: [], motivo: 'Respondeu a dúvida', ...over,
})

let seq = 0
function inbound(from: string, body: string, at = ago(2 * MIN), name = 'Ana') {
  return handleWhatsappWebhook({
    object: 'whatsapp_business_account',
    entry: [{ changes: [{ field: 'messages', value: {
      contacts: [{ wa_id: from, profile: { name } }],
      messages: [{ from, id: `wamid.in.${++seq}`, timestamp: ts(at), type: 'text', text: { body } }],
    } }] }],
  })
}

function echo(to: string, body: string, at = ago(MIN)) {
  return handleWhatsappWebhook({ entry: [{ changes: [{ field: 'smb_message_echoes', value: {
    message_echoes: [{ from: '5518999990000', to, id: `wamid.echo.${++seq}`, timestamp: ts(at), type: 'text', text: { body } }],
  } }] }] })
}

const contactOf = (waId: string) => prisma.waContact.findUniqueOrThrow({ where: { waId }, include: { messages: { orderBy: { sentAt: 'asc' } } } })

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
  decideMock.mockReset()
  sendText.mockClear()
  sendTemplate.mockClear()
  process.env.WHATSAPP_APP_SECRET = 'segredo-app'
})
afterEach(() => vi.useRealTimers())

describe('resposta automática', () => {
  it('modo simulação: classifica, escreve e registra sem enviar', async () => {
    await inbound('5518911112222', 'Oi, quanto custa um site?')
    let c = await contactOf('5518911112222')
    expect(c.awaitingReply).toBe(true)
    expect(c.name).toBe('Ana')

    decideMock.mockResolvedValueOnce(decision())
    const result = await runWhatsappAi()
    expect(result.respostas).toBe(1)
    expect((decideMock.mock.calls[0][3] as Task).type).toBe('responder')
    expect(sendText).not.toHaveBeenCalled()

    c = await contactOf('5518911112222')
    expect(c.category).toBe('lead')
    expect(c.awaitingReply).toBe(false)
    expect(c.messages.at(-1)).toMatchObject({ author: 'ia', kind: 'resposta', status: 'simulada', body: 'Oi! Faço sim, sites para barbearia. Quer ver uns modelos?' })
  })

  it('espera o contato terminar de digitar antes de responder', async () => {
    await inbound('5518911112222', 'Oi', ago(10_000))
    await runWhatsappAi()
    expect(decideMock).not.toHaveBeenCalled()
  })

  it('envios reais: manda pela API e acompanha o status sem rebaixar', async () => {
    await saveWaConfig({ ...DEFAULT_WA_CONFIG, liveMode: true })
    await inbound('5518911112222', 'Oi, quanto custa um site?')
    decideMock.mockResolvedValueOnce(decision())
    await runWhatsappAi()
    expect(sendText).toHaveBeenCalledWith('5518911112222', 'Oi! Faço sim, sites para barbearia. Quer ver uns modelos?')

    const out = (await contactOf('5518911112222')).messages.at(-1)!
    expect(out.status).toBe('enviada')
    const status = (s: string) => handleWhatsappWebhook({ entry: [{ changes: [{ field: 'messages', value: { statuses: [{ id: out.waMessageId!, status: s }] } }] }] })
    await status('read')
    await status('delivered')
    expect((await prisma.waMessage.findUniqueOrThrow({ where: { id: out.id } })).status).toBe('lida')
  })

  it('número de teste recebe de verdade mesmo em simulação', async () => {
    await saveWaConfig({ ...DEFAULT_WA_CONFIG, testNumber: '5518911112222' })
    await inbound('551811112222', 'Oi') // mesmo número, sem o 9
    decideMock.mockResolvedValueOnce(decision())
    await runWhatsappAi()
    expect(sendText).toHaveBeenCalledTimes(1)
  })

  it('contato pessoal nunca recebe, mesmo se a IA quiser responder', async () => {
    await inbound('5518933334444', 'Mãe, chego às 19h')
    decideMock.mockResolvedValueOnce(decision({ categoria: 'pessoal', acao: 'enviar', mensagem: 'Ok!' }))
    await runWhatsappAi()
    const c = await contactOf('5518933334444')
    expect(c.category).toBe('pessoal')
    expect(c.messages.filter((m) => m.direction === 'out')).toHaveLength(0)

    // Nova mensagem do contato pessoal: a IA nem é chamada para responder
    await inbound('5518933334444', 'Traz pão?', ago(MIN))
    decideMock.mockClear()
    await runWhatsappAi()
    expect(decideMock.mock.calls.every((call) => (call[3] as Task).type !== 'responder')).toBe(true)
  })

  it('categoria definida por você não é trocada pela IA', async () => {
    await inbound('5518911112222', 'Oi')
    await prisma.waContact.update({ where: { waId: '5518911112222' }, data: { category: 'pessoal', categoryByAdmin: true } })
    decideMock.mockResolvedValue(decision({ categoria: 'lead' }))
    await runWhatsappAi()
    expect((await contactOf('5518911112222')).category).toBe('pessoal')
  })

  it('quando você responde pelo celular, a IA sai de cena', async () => {
    await inbound('5518911112222', 'Oi', ago(5 * MIN))
    await echo('5518911112222', 'Oi Ana, já te respondo!')
    let c = await contactOf('5518911112222')
    expect(c.awaitingReply).toBe(false)
    expect(c.humanUntil!.getTime()).toBeGreaterThan(NOW.getTime())

    await inbound('5518911112222', 'Beleza, aguardo')
    await runWhatsappAi()
    c = await contactOf('5518911112222')
    expect(c.messages.filter((m) => m.author === 'ia')).toHaveLength(0)
  })

  it('"SAIR" descadastra e confirma; depois disso a IA não fala mais com o contato', async () => {
    await inbound('5518911112222', 'SAIR')
    let c = await contactOf('5518911112222')
    expect(c.optedOutAt).not.toBeNull()
    expect(c.messages.at(-1)).toMatchObject({ author: 'sistema', kind: 'descadastro' })

    await inbound('5518911112222', 'oi de novo')
    await runWhatsappAi()
    c = await contactOf('5518911112222')
    expect(c.messages.filter((m) => m.author === 'ia')).toHaveLength(0)
  })

  it('pedido para falar com uma pessoa: avisa você e pausa a IA', async () => {
    await inbound('5518911112222', 'Meu site saiu do ar, quero falar com alguém')
    decideMock.mockResolvedValueOnce(decision({ categoria: 'cliente', acao: 'chamar_humano', mensagem: 'Vou chamar o responsável, já te respondem!', motivo: 'Problema com site entregue' }))
    const result = await runWhatsappAi()
    expect(result.chamarHumano).toBe(1)
    const c = await contactOf('5518911112222')
    expect(c.humanUntil!.getTime()).toBeGreaterThan(NOW.getTime())
    expect(await prisma.notification.count({ where: { clientId: null, title: { contains: 'precisa de você' } } })).toBe(1)
  })

  it('reconhece cliente cadastrado pelo telefone', async () => {
    const cli = await client({ phone: '(18) 99555-6666' })
    await inbound('551895556666', 'Oi')
    const c = await contactOf('551895556666')
    expect(c.clientId).toBe(cli.id)
    expect(c.category).toBe('cliente')
  })
})

describe('valores', () => {
  it('a IA escreveu um preço: não envia, manda o aviso fixo e passa para você', async () => {
    await inbound('5518911112222', 'Quanto custa?')
    decideMock.mockResolvedValueOnce(decision({ mensagem: 'Sai por R$ 197 + R$ 29/mês!' }))
    expect((await runWhatsappAi()).chamarHumano).toBe(1)
    const c = await contactOf('5518911112222')
    const out = c.messages.filter((m) => m.direction === 'out')
    expect(out).toHaveLength(1)
    expect(out[0].body).not.toMatch(/197|29/)
    expect(c.humanUntil!.getTime()).toBeGreaterThan(NOW.getTime())
    expect(await prisma.notification.count({ where: { title: { contains: 'precisa de você' } } })).toBe(1)
  })

  it('follow-up com preço não sai', async () => {
    await prisma.waContact.create({ data: { waId: '5518955559999', category: 'lead', needsAnalysis: false, lastInboundAt: ago(22 * HOUR), lastMessageAt: ago(21 * HOUR) } })
    decideMock.mockResolvedValue(decision({ mensagem: 'Só 197 reais, aproveita!' }))
    await runWhatsappAi()
    expect(await prisma.waMessage.count({ where: { kind: 'follow_up' } })).toBe(0)
  })

  it('com a opção desligada, a IA pode falar valores', async () => {
    await saveWaConfig({ ...DEFAULT_WA_CONFIG, priceToHuman: false })
    await inbound('5518911112222', 'Quanto custa?')
    decideMock.mockResolvedValueOnce(decision({ mensagem: 'Sai por R$ 197.' }))
    await runWhatsappAi()
    expect((await contactOf('5518911112222')).messages.at(-1)!.body).toBe('Sai por R$ 197.')
  })
})

describe('falhas da IA', () => {
  it('recusa: marca como processado e não tenta de novo a cada minuto', async () => {
    const { AiRefusal } = await import('@/lib/whatsapp/ai')
    await inbound('5518911112222', 'Oi')
    decideMock.mockRejectedValue(new AiRefusal('recusou'))
    expect((await runWhatsappAi()).erros).toBe(1)
    expect((await contactOf('5518911112222')).awaitingReply).toBe(false)
    decideMock.mockClear()
    await runWhatsappAi()
    expect(decideMock).not.toHaveBeenCalled()
  })

  it('erro passageiro da API: tenta de novo na próxima rodada', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    await inbound('5518911112222', 'Oi')
    decideMock.mockRejectedValueOnce(new Anthropic.RateLimitError(429, undefined, 'limite', new Headers()))
    await runWhatsappAi()
    expect((await contactOf('5518911112222')).awaitingReply).toBe(true)
    decideMock.mockResolvedValueOnce(decision())
    expect((await runWhatsappAi()).respostas).toBe(1)
  })
})

describe('follow-up', () => {
  async function staleLead(waId: string, lastInbound: Date, lastOut: Date) {
    await prisma.waContact.create({
      data: {
        waId, name: 'Bruno', category: 'lead', needsAnalysis: false, lastInboundAt: lastInbound, lastOutboundAt: lastOut, lastMessageAt: lastOut,
        messages: { create: [
          { direction: 'in', author: 'contato', body: 'Quanto fica?', status: 'recebida', sentAt: lastInbound },
          { direction: 'out', author: 'ia', kind: 'resposta', body: 'R$ 97!', status: 'enviada', sentAt: lastOut },
        ] },
      },
    })
  }

  it('janela aberta: texto livre, e só um por etapa', async () => {
    await staleLead('5518955550001', ago(22 * HOUR), ago(21 * HOUR))
    decideMock.mockResolvedValue(decision({ mensagem: 'Conseguiu ver os modelos?' }))
    expect((await runWhatsappAi()).followUps).toBe(1)
    expect((decideMock.mock.calls[0][3] as Task).type).toBe('follow_up')
    let c = await contactOf('5518955550001')
    expect(c.followUpCount).toBe(1)
    expect(c.messages.at(-1)).toMatchObject({ kind: 'follow_up', body: 'Conseguiu ver os modelos?' })

    decideMock.mockClear()
    await runWhatsappAi()
    expect(decideMock.mock.calls.some((call) => (call[3] as Task).type === 'follow_up')).toBe(false)
  })

  it('janela fechada sem modelo aprovado: não chama a IA', async () => {
    await staleLead('5518955550002', ago(80 * HOUR), ago(79 * HOUR))
    await runWhatsappAi()
    expect(decideMock).not.toHaveBeenCalled()
  })

  it('janela fechada com modelo: envia o modelo com as variáveis da IA', async () => {
    await saveWaConfig({ ...DEFAULT_WA_CONFIG, liveMode: true, followUpTemplateName: 'retomada', followUpTemplateBody: 'Oi {{1}}! {{2}}' })
    await staleLead('5518955550003', ago(80 * HOUR), ago(79 * HOUR))
    decideMock.mockResolvedValue(decision({ mensagem: '', parametros: ['Bruno', 'Ainda quer\no site?'] }))
    await runWhatsappAi()
    expect(sendTemplate).toHaveBeenCalledWith('5518955550003', 'retomada', 'pt_BR', ['Bruno', 'Ainda quer o site?'])
  })

  it('a IA decide não insistir: encerra os follow-ups da conversa', async () => {
    await staleLead('5518955550004', ago(22 * HOUR), ago(21 * HOUR))
    decideMock.mockResolvedValue(decision({ acao: 'nada', mensagem: '' }))
    await runWhatsappAi()
    expect((await contactOf('5518955550004')).followUpCount).toBe(3)
  })

  it('fora do horário não faz follow-up', async () => {
    vi.setSystemTime(new Date('2026-11-24T23:30:00Z')) // 20h30 em SP
    await prisma.waContact.create({ data: { waId: '5518955550005', category: 'lead', needsAnalysis: false, lastInboundAt: ago(-8 * HOUR), lastMessageAt: ago(-8 * HOUR) } })
    await runWhatsappAi()
    expect(decideMock).not.toHaveBeenCalled()
  })
})

describe('campanhas', () => {
  it('oferece só para a categoria certa, uma vez por contato, e conclui', async () => {
    await saveWaConfig({ ...DEFAULT_WA_CONFIG, liveMode: true })
    const camp = await prisma.waCampaign.create({
      data: { name: 'Plus', offer: 'Upgrade para o Plus com 1 alteração por mês', categories: ['cliente'], templateName: 'oferta_plus', templateBody: 'Oi {{1}}, {{2}}', status: 'ativa' },
    })
    await prisma.waContact.create({ data: { waId: '5518966660001', category: 'cliente', needsAnalysis: false, lastMessageAt: ago(400 * HOUR), lastInboundAt: ago(400 * HOUR) } })
    await prisma.waContact.create({ data: { waId: '5518966660002', category: 'lead', needsAnalysis: false } })
    await prisma.waContact.create({ data: { waId: '5518966660003', category: 'pessoal', needsAnalysis: false } })

    decideMock.mockResolvedValue(decision({ categoria: 'cliente', mensagem: '', parametros: ['Carla', 'que tal o Plus?'] }))
    expect((await runWhatsappAi()).ofertas).toBe(1)
    expect(sendTemplate).toHaveBeenCalledTimes(1)
    expect(sendTemplate).toHaveBeenCalledWith('5518966660001', 'oferta_plus', 'pt_BR', ['Carla', 'que tal o Plus?'])
    expect(await prisma.waCampaignSend.count({ where: { campaignId: camp.id, status: 'enviado' } })).toBe(1)

    await runWhatsappAi()
    expect(sendTemplate).toHaveBeenCalledTimes(1)
    expect((await prisma.waCampaign.findUniqueOrThrow({ where: { id: camp.id } })).status).toBe('concluida')
  })

  it('respeita o limite diário de mensagens proativas', async () => {
    await saveWaConfig({ ...DEFAULT_WA_CONFIG, dailyLimit: 2 })
    await prisma.waCampaign.create({ data: { name: 'Leads', offer: 'Mini site R$ 97', categories: ['lead'], templateName: 't', templateBody: '{{1}}', status: 'ativa' } })
    for (let i = 0; i < 4; i++) await prisma.waContact.create({ data: { waId: `551897777000${i}`, category: 'lead', needsAnalysis: false } })
    decideMock.mockResolvedValue(decision({ mensagem: '', parametros: ['Oi!'] }))
    await runWhatsappAi()
    await runWhatsappAi()
    expect(await prisma.waMessage.count({ where: { kind: 'oferta' } })).toBe(2)
  })
})

describe('histórico e contatos (coexistência)', () => {
  it('importa conversas antigas e a agenda', async () => {
    await handleWhatsappWebhook({ entry: [{ changes: [
      { field: 'smb_app_state_sync', value: { state_sync: [{ type: 'contact', action: 'add', contact: { full_name: 'Dona Maria', phone_number: '+55 18 98888-1111' } }] } },
      { field: 'history', value: { history: [{ metadata: { phase: 1, progress: 100 }, threads: [{ id: '5518988881111', messages: [
        { from: '5518988881111', id: 'h1', timestamp: ts(ago(30 * 24 * HOUR)), type: 'text', text: { body: 'Vocês fazem loja virtual?' } },
        { from: '5518999990000', to: '5518988881111', id: 'h2', timestamp: ts(ago(30 * 24 * HOUR - MIN)), type: 'text', text: { body: 'Fazemos sim!' } },
      ] }] }] } },
    ] }] })
    const c = await contactOf('5518988881111')
    expect(c.name).toBe('Dona Maria')
    expect(c.messages.map((m) => [m.author, m.status])).toEqual([['contato', 'historico'], ['voce', 'historico']])
    expect(c.awaitingReply).toBe(false)
    expect(c.needsAnalysis).toBe(true)
  })
})

describe('rota do webhook', () => {
  const body = JSON.stringify({ entry: [] })
  const req = (signature: string) => new NextRequest('https://topsitebr.com.br/api/webhooks/whatsapp', { method: 'POST', body, headers: { 'x-hub-signature-256': signature } })

  it('aceita só com a assinatura da Meta', async () => {
    expect((await POST(req('sha256=errada'))).status).toBe(401)
    const good = 'sha256=' + createHmac('sha256', 'segredo-app').update(body).digest('hex')
    expect((await POST(req(good))).status).toBe(200)
  })
})
