import { prisma } from '@/lib/prisma'
import { expireIfNeeded } from './service'
import { processSequence } from './sequence'

/** Cron diário: expira propostas com prazo vencido e envia os e-mails da sequência que venceram. */
export async function processOnlineProposals() {
  const open = await prisma.onlineProposal.findMany({
    where: { status: { in: ['prospect', 'previa_enviada', 'ajuste_solicitado', 'aprovada'] }, expiresAt: { lte: new Date() } },
  })
  for (const p of open) await expireIfNeeded(p)
  const emails = await processSequence()
  return { expired: open.length, ...emails }
}
