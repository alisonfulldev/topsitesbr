import { describe, expect, it } from 'vitest'
import { paymentToken, verifyPaymentToken, paymentLink } from '@/lib/pix-payment-link'
import { publicLinks } from '@/lib/integrations/resend'
import { buildMonthlyContract, earlyTerminationQuote, subscriptionPrice, addMonths } from '@/lib/monthly-plan'
import { buildOnlineContract, contractHash } from '@/lib/online-proposal/contract'
import { isWithinWindow, scheduleFor } from '@/lib/online-proposal/sequence'
import { DEFAULT_CONFIG } from '@/lib/online-proposal/config'

describe('link de pagamento sem login', () => {
  const id = '0cb2e385-d749-470b-9df9-0ef7d24ac9ff'
  it('token válido identifica a assinatura', () => expect(verifyPaymentToken(paymentToken(id))).toBe(id))
  it('rejeita assinatura adulterada, id trocado e lixo', () => {
    const [enc, sig] = paymentToken(id).split('.')
    expect(verifyPaymentToken(`${enc}.${sig.slice(0, -1)}${sig.endsWith('x') ? 'y' : 'x'}`)).toBeNull()
    expect(verifyPaymentToken(`${Buffer.from('outro-id').toString('base64url')}.${sig}`)).toBeNull()
    expect(verifyPaymentToken('abc')).toBeNull()
  })
  it('aponta para o site, nunca para localhost', () => {
    expect(paymentLink(id)).toMatch(/^https:\/\/topsitebr\.com\.br\/pagar\//)
  })
})

describe('e-mails sem localhost', () => {
  it('troca qualquer link local pelo endereço do site', () => {
    expect(publicLinks('<a href="http://localhost:3000/painel">x</a> http://127.0.0.1:3000/termos')).toBe(
      '<a href="https://topsitebr.com.br/painel">x</a> https://topsitebr.com.br/termos',
    )
    expect(publicLinks('https://topsitebr.com.br/pagar/abc')).toBe('https://topsitebr.com.br/pagar/abc')
  })
})

describe('regras do plano mensal', () => {
  it('valor próprio da assinatura sobrepõe o do plano', () => {
    expect(subscriptionPrice({ customPrice: '67', plan: { price: '0' } })).toBe(67)
    expect(subscriptionPrice({ customPrice: null, plan: { price: '29' } })).toBe(29)
  })
  it('quitação só existe para contratos com fidelidade (mensal-1.0)', () => {
    const now = new Date('2026-11-04T12:00:00')
    expect(earlyTerminationQuote({ monthlyPrice: 67, paidMonths: 2, fidelityEndsAt: addMonths(new Date('2026-09-04T12:00:00'), 6), now }).total).toBe(273.36)
    expect(earlyTerminationQuote({ monthlyPrice: 67, paidMonths: 2, fidelityEndsAt: null, now }).inFidelity).toBe(false)
  })
  it('contrato atual: sem fidelidade, sem negativação, com reativação de R$ 50', () => {
    const text = buildMonthlyContract({ name: 'Ana <b>', document: '123', email: 'a@x.com', phone: null, monthlyPrice: 49 }).replace(/<[^>]+>/g, ' ')
    expect(text).toContain('Não há fidelidade')
    expect(text).toMatch(/R\$\s50,00/)
    expect(text).not.toMatch(/Serasa|protesto|judicial|quitação/i)
    expect(text).not.toContain('<b>')
  })
})

describe('contrato da proposta online', () => {
  const c = buildOnlineContract({ name: 'Ana', company: 'Padaria', document: '52998224725', email: 'a@x.com', whatsapp: null, planKey: 'com_painel', planName: 'Com painel', setupPrice: 470, monthlyPrice: 70, extras: [{ key: 'b', name: 'Botão', price: 300 }], previewLink: 'https://x/p' })
  it('soma setup + extras e não tem cobrança judicial', () => {
    expect(c).toContain('770,00')
    expect(c).not.toMatch(/Serasa|protesto/)
  })
  it('hash muda se o texto mudar', () => {
    expect(contractHash(c)).toHaveLength(64)
    expect(contractHash(c)).not.toBe(contractHash(c + ' '))
  })
})

describe('janela de envio da sequência (horário de Brasília)', () => {
  const sp = (iso: string) => new Date(iso + '-03:00')
  it('8h–19h', () => {
    expect(isWithinWindow(sp('2026-11-10T10:00:00'), DEFAULT_CONFIG)).toBe(true)
    expect(isWithinWindow(sp('2026-11-10T19:00:00'), DEFAULT_CONFIG)).toBe(false)
  })
  it('prévia enviada às 21h: 1º e-mail às 8h do dia seguinte', () => {
    expect(scheduleFor(sp('2026-11-10T21:00:00'), 0, DEFAULT_CONFIG).toISOString()).toBe(sp('2026-11-11T08:00:00').toISOString())
  })
})
