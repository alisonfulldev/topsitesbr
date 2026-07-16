'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ExtraRevenueCategory } from '@prisma/client'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')
}

export async function createExtraRevenue(data: {
  category: ExtraRevenueCategory
  description: string
  amount: string
  revenueDate: string
}) {
  await requireAdmin()
  await prisma.extraRevenue.create({
    data: {
      category: data.category,
      description: data.description.trim(),
      amount: parseFloat(data.amount),
      revenueDate: new Date(data.revenueDate),
    },
  })
  revalidatePath('/admin/financeiro/receitas')
  revalidatePath('/admin/financeiro')
}

export async function updateExtraRevenue(
  id: string,
  data: {
    category: ExtraRevenueCategory
    description: string
    amount: string
    revenueDate: string
  }
) {
  await requireAdmin()
  await prisma.extraRevenue.update({
    where: { id },
    data: {
      category: data.category,
      description: data.description.trim(),
      amount: parseFloat(data.amount),
      revenueDate: new Date(data.revenueDate),
    },
  })
  revalidatePath('/admin/financeiro/receitas')
  revalidatePath('/admin/financeiro')
}

export async function deleteExtraRevenue(id: string) {
  await requireAdmin()
  await prisma.extraRevenue.delete({ where: { id } })
  revalidatePath('/admin/financeiro/receitas')
  revalidatePath('/admin/financeiro')
}
