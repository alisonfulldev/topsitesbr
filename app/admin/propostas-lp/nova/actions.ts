'use server'

import { randomBytes } from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { APP_URL } from '@/lib/config'

export async function createPresentationProposalAction(formData: FormData): Promise<{
  error?: string
  link?: string
}> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return { error: 'Não autorizado.' }

  const clientName = (formData.get('clientName') as string)?.trim()
  const valueRaw = (formData.get('value') as string)?.replace(',', '.')
  const scope = (formData.get('scope') as string)?.trim()
  const details = (formData.get('details') as string)?.trim() || null
  const mode = (formData.get('mode') as string) === 'completa' ? 'completa' : 'apresentacao'

  if (!clientName || !valueRaw || !scope) {
    return { error: 'Preencha os campos obrigatórios: nome do cliente, valor e escopo.' }
  }

  const value = parseFloat(valueRaw)
  if (isNaN(value) || value <= 0) {
    return { error: 'Informe um valor válido para a proposta.' }
  }

  const token = randomBytes(32).toString('hex')

  const proposal = await prisma.presentationProposal.create({
    data: { token, clientName, value, scope, details, mode },
  })

  return { link: `${APP_URL}/p/${proposal.token}` }
}
