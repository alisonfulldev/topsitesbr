'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function upsertTemplate(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') throw new Error('Não autorizado')

  const slot = parseInt(formData.get('slot') as string)
  const name = (formData.get('name') as string)?.trim()
  const file = formData.get('html') as File | null

  if (!name) throw new Error('Nome do template é obrigatório')
  if (!file || file.size === 0) throw new Error('Arquivo HTML é obrigatório')
  if (slot !== 1 && slot !== 2) throw new Error('Slot inválido')

  const html = await file.text()

  await prisma.systemTemplate.upsert({
    where: { slot },
    create: { slot, name, html },
    update: { name, html },
  })

  revalidatePath('/admin/apresentacoes/templates')
  revalidatePath('/modelos')
}
