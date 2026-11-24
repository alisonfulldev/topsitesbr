// Importa conversas antigas (exportadas do celular ou lidas do WhatsApp Web) como histórico.
// A IA classifica depois (cliente / lead / pessoal) na rodada normal do cron.

import { createHash } from 'crypto'
import { prisma } from '@/lib/prisma'
import type { ParsedChat } from './chat-export'
import { ensureContact } from './engine'
import { refreshTimeline } from './webhook'

export interface ImportOptions {
  ownerName: string
  // Contatos que nunca devem receber nada (nome da conversa)
  block?: RegExp
}

export interface ImportResult {
  conversas: number
  mensagens: number
  semNumero: string[]
  bloqueados: string[]
}

function messageKey(waId: string, at: Date, sender: string, body: string) {
  return 'import:' + createHash('sha1').update(`${waId}|${at.getTime()}|${sender}|${body}`).digest('hex').slice(0, 24)
}

export async function importChats(chats: ParsedChat[], opts: ImportOptions): Promise<ImportResult> {
  const result: ImportResult = { conversas: 0, mensagens: 0, semNumero: [], bloqueados: [] }

  for (const chat of chats) {
    if (!chat.messages.length) continue
    if (!chat.phone) {
      result.semNumero.push(chat.title)
      continue
    }
    const contact = await ensureContact(chat.phone, /^\+?\d[\d\s()-]+$/.test(chat.title) ? null : chat.title)
    const rows = chat.messages.map((m) => {
      const fromOwner = m.sender === opts.ownerName
      return {
        contactId: contact.id,
        // Chave estável: importar de novo não duplica
        waMessageId: messageKey(contact.waId, m.at, m.sender, m.body),
        direction: fromOwner ? 'out' : 'in',
        author: fromOwner ? 'voce' : 'contato',
        type: 'text',
        body: m.body,
        status: 'historico',
        sentAt: m.at,
      }
    })
    const { count } = await prisma.waMessage.createMany({ data: rows, skipDuplicates: true })
    await refreshTimeline(contact.id)

    if (opts.block?.test(chat.title)) {
      await prisma.waContact.update({
        where: { id: contact.id },
        data: {
          category: 'pessoal', categoryByAdmin: true, aiPaused: true, optedOutAt: new Date(),
          needsAnalysis: false, summary: 'Bloqueado a pedido do dono: nunca enviar nada.',
        },
      })
      result.bloqueados.push(chat.title)
    }
    result.conversas++
    result.mensagens += count
  }
  return result
}
