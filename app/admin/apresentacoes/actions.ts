'use server'

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function createPresentation(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') throw new Error('Não autorizado')

  const leadName = (formData.get('leadName') as string)?.trim()
  const leadPhone = (formData.get('leadPhone') as string)?.trim() || null
  const leadEmail = (formData.get('leadEmail') as string)?.trim() || null
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!leadName) throw new Error('Nome do lead é obrigatório')

  const token = randomBytes(8).toString('hex')

  const presentation = await prisma.templatePresentation.create({
    data: {
      token,
      leadName,
      leadPhone,
      leadEmail,
      notes,
    },
  })

  redirect(`/admin/apresentacoes/${presentation.id}`)
}

export async function deletePresentation(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') throw new Error('Não autorizado')

  await prisma.templatePresentation.delete({ where: { id } })

  revalidatePath('/admin/apresentacoes')
  redirect('/admin/apresentacoes')
}

export async function cancelPresentation(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') throw new Error('Não autorizado')

  await prisma.templatePresentation.update({
    where: { id },
    data: { status: 'cancelado' },
  })

  revalidatePath('/admin/apresentacoes')
  revalidatePath(`/admin/apresentacoes/${id}`)
}
