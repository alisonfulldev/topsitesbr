'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendNotification } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'
import { TicketStatus } from '@prisma/client'

async function assertAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') throw new Error('Não autorizado.')
}

const CHANGE_TYPE_LABEL: Record<string, string> = {
  correcao: 'Correção no site',
  texto: 'Alteração de Texto',
  imagem: 'Alteração de Imagem',
  texto_e_imagem: 'Alteração de Texto e Imagem',
  nova_secao: 'Nova Seção',
  nova_pagina: 'Nova Página',
  duvida: 'Dúvida',
  outro: 'Outro',
}

export async function updateTicketStatus(
  ticketId: string,
  newStatus: TicketStatus,
): Promise<{ error?: string; success?: boolean }> {
  await assertAdmin()

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      client: { select: { id: true, name: true } },
      site: { select: { siteUrl: true, siteType: true } },
    },
  })
  if (!ticket) return { error: 'Solicitação não encontrada.' }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: newStatus },
  })

  if (newStatus === 'done') {
    const label = CHANGE_TYPE_LABEL[ticket.changeType] ?? ticket.changeType
    const siteRef = ticket.site.siteUrl ?? ticket.site.siteType
    await sendNotification(
      ticket.client.id,
      'Solicitação concluída',
      `Sua solicitação de "${label}" foi concluída. Confira as alterações no seu site${siteRef ? ` (${siteRef})` : ''}.`,
      'painel',
      'ticket-done',
    )
  }

  revalidatePath('/admin/solicitacoes')
  return { success: true }
}
