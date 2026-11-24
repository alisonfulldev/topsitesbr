import { describe, expect, it } from 'vitest'
import { guessOwnerName, parseChatExport, phoneFrom, titleFromFileName } from '@/lib/whatsapp/chat-export'

const ANDROID = `24/08/2026 14:03 - As mensagens e as ligações são protegidas com a criptografia de ponta a ponta.
24/08/2026 14:03 - +55 18 99123-4567: Oi, vi o anúncio. Quanto fica um site?
24/08/2026 14:10 - Top Site: Oi! Tudo bem? Fica 197 o site e 29 por mês.
Te mando uns modelos
24/08/2026 14:12 - +55 18 99123-4567: <Mídia oculta>
25/08/2026 09:00 - +55 18 99123-4567: Vou ver e te falo`

const IOS = `[24/08/26, 14:03:10] Top Site: ‎Oi Maria!
[24/08/26, 14:05:00] Maria Salão: Quero sim
[24/08/26, 14:06:00] Maria Salão: ‎imagem ocultada
[24/08/26, 14:07:00] Top Site: Esta mensagem foi apagada`

describe('exportação de conversa do WhatsApp', () => {
  it('Android: mensagens, quebra de linha, mídia, sistema e horário de Brasília', () => {
    const chat = parseChatExport('Conversa do WhatsApp com +55 18 99123-4567.txt', ANDROID)
    expect(chat.messages).toHaveLength(4)
    expect(chat.messages[1].body).toBe('Oi! Tudo bem? Fica 197 o site e 29 por mês.\nTe mando uns modelos')
    expect(chat.messages[2].body).toBe('[mídia]')
    expect(chat.messages[0].at.toISOString()).toBe('2026-08-24T17:03:00.000Z')
    expect(chat.phone).toBe('5518991234567')
    expect(chat.senders).toEqual(['+55 18 99123-4567', 'Top Site'])
  })

  it('iPhone: colchetes, ano com 2 dígitos, segundos e caracteres invisíveis', () => {
    const chat = parseChatExport('WhatsApp Chat - Maria Salão.txt', IOS)
    expect(chat.title).toBe('Maria Salão')
    expect(chat.messages.map((m) => m.body)).toEqual(['Oi Maria!', 'Quero sim', '[mídia]', '[mensagem apagada]'])
    expect(chat.messages[0].at.toISOString()).toBe('2026-08-24T17:03:10.000Z')
    expect(chat.phone).toBeNull()
  })

  it('descobre quem é você pelo remetente comum a todos os arquivos', () => {
    const a = parseChatExport('Conversa do WhatsApp com +55 18 99123-4567.txt', ANDROID)
    const b = parseChatExport('WhatsApp Chat - Maria Salão.txt', IOS)
    expect(guessOwnerName([a, b])).toBe('Top Site')
    expect(guessOwnerName([b])).toBe('Top Site')
  })

  it('nomes de arquivo e números', () => {
    expect(titleFromFileName('Conversa do WhatsApp com João (2).txt')).toBe('João')
    expect(phoneFrom('+55 18 99123-4567')).toBe('5518991234567')
    expect(phoneFrom('(18) 99123-4567')).toBe('5518991234567')
    expect(phoneFrom('João')).toBeNull()
  })
})

describe('conversa lida do WhatsApp Web', () => {
  it('lê o prefixo "[HH:MM, dd/mm/aaaa] Remetente: " e acha o número', async () => {
    const { parseWebExport } = await import('@/lib/whatsapp/chat-export')
    const chat = parseWebExport({
      title: 'Loja da Ana',
      phone: '+55 11 97346-9398',
      messages: [
        { pre: '[07:28, 23/10/2026] Loja da Ana: ', text: 'Oi, quanto custa?' },
        { pre: '[11:42, 23/10/2026] Top Site: ', text: 'Oi Ana!' },
        { pre: 'lixo', text: 'ignorado' },
      ],
    })
    expect(chat.messages.map((m) => [m.sender, m.body])).toEqual([['Loja da Ana', 'Oi, quanto custa?'], ['Top Site', 'Oi Ana!']])
    expect(chat.messages[0].at.toISOString()).toBe('2026-10-23T10:28:00.000Z')
    expect(chat.phone).toBe('5511973469398')
  })
})
