// Importa o arquivo gerado pela leitura do WhatsApp Web (whatsapp-conversas.json) para o banco.
// Uso: npx tsx scripts/import-whatsapp-web.ts <arquivo.json> [--dry]
// Lê DATABASE_URL do .env. Não mostra o conteúdo das mensagens, só contagens.

import fs from 'fs'
import { guessOwnerName, parseWebExport, type WebExportItem } from '@/lib/whatsapp/chat-export'

const file = process.argv[2]
const dry = process.argv.includes('--dry')
if (!file) {
  console.error('Uso: npx tsx scripts/import-whatsapp-web.ts <arquivo.json> [--dry]')
  process.exit(1)
}

// Pedido do dono: nunca mexer com esse contato
const BLOCK = /humb?erto/i

async function main() {
  const items = JSON.parse(fs.readFileSync(file, 'utf-8')) as WebExportItem[]
  const chats = items.map(parseWebExport)
  const owner = guessOwnerName(chats)
  if (!owner) throw new Error('Não consegui identificar o seu nome nas conversas')
  const withMsgs = chats.filter((c) => c.messages.length)
  console.log(`conversas: ${chats.length} | com mensagens: ${withMsgs.length} | sem número: ${withMsgs.filter((c) => !c.phone).length}`)
  console.log(`seu nome nas conversas: ${owner.replace(/\S/g, '•')} (${owner.length} letras) | bloqueados: ${chats.filter((c) => BLOCK.test(c.title)).length}`)
  if (dry) return

  const { importChats } = await import('@/lib/whatsapp/import')
  const { prisma } = await import('@/lib/prisma')
  const r = await importChats(chats, { ownerName: owner, block: BLOCK })
  console.log(`importadas: ${r.conversas} conversas, ${r.mensagens} mensagens novas | sem número: ${r.semNumero.length} | bloqueados: ${r.bloqueados.length}`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
