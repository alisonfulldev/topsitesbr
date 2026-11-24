import { describe, expect, it } from 'vitest'
import {
  blockReason, cleanTemplateParam, followUpDue, isOptOut, offerAllowed, phoneVariants, replyDue, samePhone, windowOpen, type ContactState,
} from '@/lib/whatsapp/rules'
import { renderTemplate, templateVarCount } from '@/lib/whatsapp/config'
import { messageText } from '@/lib/whatsapp/webhook'

const NOW = new Date('2026-11-24T15:00:00Z')
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3600_000)

const base: ContactState = {
  category: 'lead', aiPaused: false, humanUntil: null, optedOutAt: null,
  lastInboundAt: hoursAgo(30), lastMessageAt: hoursAgo(30), awaitingReply: false, followUpCount: 0, lastOfferAt: null,
}

describe('telefones', () => {
  it('casa número com e sem o 9º dígito e com/sem DDI', () => {
    expect(samePhone('5518996742364', '551896742364')).toBe(true)
    expect(samePhone('(18) 99674-2364', '5518996742364')).toBe(true)
    expect(samePhone('18996742364', '551896742364')).toBe(true)
    expect(samePhone('5518996742364', '5518996742365')).toBe(false)
    expect(samePhone('', '5518996742364')).toBe(false)
  })
  it('variações de celular', () => {
    expect(phoneVariants('5518996742364')).toEqual(['5518996742364', '551896742364'])
  })
})

describe('descadastro', () => {
  it.each(['SAIR', 'sair.', ' Parar ', 'não quero mais receber isso', 'Me tira da lista por favor', 'PARE DE ME MANDAR mensagem'])('reconhece "%s"', (t) => expect(isOptOut(t)).toBe(true))
  it.each(['quero sair de casa cedo amanhã', 'vou parar no posto', 'quanto custa?', ''])('não confunde "%s"', (t) => expect(isOptOut(t)).toBe(false))
})

describe('janela e bloqueios', () => {
  it('janela de 24h conta só a mensagem do contato', () => {
    expect(windowOpen({ lastInboundAt: hoursAgo(23) }, NOW)).toBe(true)
    expect(windowOpen({ lastInboundAt: hoursAgo(25) }, NOW)).toBe(false)
    expect(windowOpen({ lastInboundAt: null }, NOW)).toBe(false)
  })
  it('bloqueia pessoal, revisar, não classificado, pausado, descadastrado e atendimento humano', () => {
    expect(blockReason(base, NOW)).toBeNull()
    expect(blockReason({ ...base, category: 'cliente' }, NOW)).toBeNull()
    expect(blockReason({ ...base, category: 'pessoal' }, NOW)).toMatch(/pessoal/)
    expect(blockReason({ ...base, category: 'revisar' }, NOW)).toBeTruthy()
    expect(blockReason({ ...base, category: 'nao_classificado' }, NOW)).toBeTruthy()
    expect(blockReason({ ...base, aiPaused: true }, NOW)).toBeTruthy()
    expect(blockReason({ ...base, optedOutAt: hoursAgo(100) }, NOW)).toBeTruthy()
    expect(blockReason({ ...base, humanUntil: hoursAgo(-2) }, NOW)).toMatch(/atendendo/)
    expect(blockReason({ ...base, humanUntil: hoursAgo(2) }, NOW)).toBeNull()
  })
  it('resposta espera alguns segundos para juntar mensagens seguidas', () => {
    expect(replyDue({ ...base, awaitingReply: true, lastInboundAt: new Date(NOW.getTime() - 10_000) }, NOW)).toBe(false)
    expect(replyDue({ ...base, awaitingReply: true, lastInboundAt: new Date(NOW.getTime() - 60_000) }, NOW)).toBe(true)
    expect(replyDue({ ...base, awaitingReply: true, lastInboundAt: hoursAgo(25) }, NOW)).toBe(false)
  })
})

describe('follow-up', () => {
  const hours = [20, 72, 168]
  it('segue a cadência pelo número de follow-ups já feitos', () => {
    expect(followUpDue({ ...base, lastMessageAt: hoursAgo(21) }, NOW, hours, 30)).toBe(true)
    expect(followUpDue({ ...base, lastMessageAt: hoursAgo(19) }, NOW, hours, 30)).toBe(false)
    expect(followUpDue({ ...base, lastMessageAt: hoursAgo(50), followUpCount: 1 }, NOW, hours, 30)).toBe(false)
    expect(followUpDue({ ...base, lastMessageAt: hoursAgo(73), followUpCount: 1 }, NOW, hours, 30)).toBe(true)
    expect(followUpDue({ ...base, lastMessageAt: hoursAgo(500), followUpCount: 3 }, NOW, hours, 30)).toBe(false)
  })
  it('não faz follow-up de conversa velha, de cliente, de pessoal nem de quem está esperando resposta', () => {
    expect(followUpDue({ ...base, lastMessageAt: hoursAgo(24 * 40) }, NOW, hours, 30)).toBe(false)
    expect(followUpDue({ ...base, category: 'cliente', lastMessageAt: hoursAgo(21) }, NOW, hours, 30)).toBe(false)
    expect(followUpDue({ ...base, category: 'pessoal', lastMessageAt: hoursAgo(21) }, NOW, hours, 30)).toBe(false)
    expect(followUpDue({ ...base, awaitingReply: true, lastInboundAt: hoursAgo(21), lastMessageAt: hoursAgo(21) }, NOW, hours, 30)).toBe(false)
  })
})

describe('ofertas', () => {
  it('respeita categoria da campanha e intervalo entre ofertas', () => {
    expect(offerAllowed(base, NOW, ['lead'], 15)).toBe(true)
    expect(offerAllowed(base, NOW, ['cliente'], 15)).toBe(false)
    expect(offerAllowed({ ...base, lastOfferAt: hoursAgo(24 * 10) }, NOW, ['lead'], 15)).toBe(false)
    expect(offerAllowed({ ...base, lastOfferAt: hoursAgo(24 * 16) }, NOW, ['lead'], 15)).toBe(true)
    expect(offerAllowed({ ...base, category: 'pessoal' }, NOW, ['lead', 'pessoal'], 15)).toBe(false)
  })
})

describe('modelos', () => {
  it('conta e preenche variáveis', () => {
    const body = 'Oi {{1}}! {{2}} Responda SAIR para não receber.'
    expect(templateVarCount(body)).toBe(2)
    expect(renderTemplate(body, ['Ana', 'Temos novidade.'])).toBe('Oi Ana! Temos novidade. Responda SAIR para não receber.')
    expect(templateVarCount('sem variáveis')).toBe(0)
  })
  it('limpa valores que a Meta recusaria', () => {
    expect(cleanTemplateParam('linha 1\nlinha 2\t  fim     ')).toBe('linha 1 linha 2 fim')
  })
})

describe('conteúdo das mensagens recebidas', () => {
  it('texto, mídia, áudio e tipos ignorados', () => {
    expect(messageText({ id: '1', timestamp: '0', type: 'text', text: { body: 'oi' } })).toBe('oi')
    expect(messageText({ id: '1', timestamp: '0', type: 'image', image: { caption: 'meu logo' } })).toBe('[imagem] meu logo')
    expect(messageText({ id: '1', timestamp: '0', type: 'audio' })).toMatch(/áudio/)
    expect(messageText({ id: '1', timestamp: '0', type: 'interactive', interactive: { button_reply: { title: 'Quero' } } })).toBe('Quero')
    expect(messageText({ id: '1', timestamp: '0', type: 'system' })).toBeNull()
  })
})
