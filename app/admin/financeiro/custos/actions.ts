'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CostCategory } from '@prisma/client'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')
}

export async function createCost(data: {
  category: CostCategory
  description: string
  amount: string
  costDate: string
  isRecurring: boolean
  recurrenceFrequency?: string
}) {
  await requireAdmin()
  await prisma.cost.create({
    data: {
      category: data.category,
      description: data.description.trim(),
      amount: parseFloat(data.amount),
      costDate: new Date(data.costDate),
      isRecurring: data.isRecurring,
      recurrenceFrequency: data.isRecurring ? (data.recurrenceFrequency || 'mensal') : null,
    },
  })
  revalidatePath('/admin/financeiro/custos')
}

export async function updateCost(
  id: string,
  data: {
    category: CostCategory
    description: string
    amount: string
    costDate: string
    isRecurring: boolean
    recurrenceFrequency?: string
  }
) {
  await requireAdmin()
  await prisma.cost.update({
    where: { id },
    data: {
      category: data.category,
      description: data.description.trim(),
      amount: parseFloat(data.amount),
      costDate: new Date(data.costDate),
      isRecurring: data.isRecurring,
      recurrenceFrequency: data.isRecurring ? (data.recurrenceFrequency || 'mensal') : null,
    },
  })
  revalidatePath('/admin/financeiro/custos')
}

export async function deleteCost(id: string) {
  await requireAdmin()
  await prisma.cost.delete({ where: { id } })
  revalidatePath('/admin/financeiro/custos')
}
