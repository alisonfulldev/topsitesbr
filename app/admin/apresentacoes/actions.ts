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
  const template1Name = (formData.get('template1Name') as string)?.trim()
  const template2Name = (formData.get('template2Name') as string)?.trim()
  const notes = (formData.get('notes') as string)?.trim() || null

  const t1File = formData.get('template1') as File | null
  const t2File = formData.get('template2') as File | null

  if (!leadName) throw new Error('Nome do lead é obrigatório')
  if (!template1Name || !template2Name) throw new Error('Nome dos templates é obrigatório')
  if (!t1File || t1File.size === 0) throw new Error('Template 1 é obrigatório')
  if (!t2File || t2File.size === 0) throw new Error('Template 2 é obrigatório')

  const template1Html = await t1File.text()
  const template2Html = await t2File.text()
  const token = randomBytes(8).toString('hex')

  const presentation = await prisma.templatePresentation.create({
    data: {
      token,
      leadName,
      leadPhone,
      leadEmail,
      template1Name,
      template2Name,
      template1Html,
      template2Html,
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
