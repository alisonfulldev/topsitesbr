'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')
}

// ── Fixed Costs ───────────────────────────────────────────────────────────────

export async function createFixedCost(data: { name: string; amount: string }) {
  await requireAdmin()
  const count = await prisma.allocationFixedCost.count()
  await prisma.allocationFixedCost.create({
    data: { name: data.name.trim(), amount: parseFloat(data.amount), order: count + 1 },
  })
  revalidatePath('/admin/financeiro/distribuicao')
}

export async function updateFixedCost(id: string, data: { name: string; amount: string }) {
  await requireAdmin()
  await prisma.allocationFixedCost.update({
    where: { id },
    data: { name: data.name.trim(), amount: parseFloat(data.amount) },
  })
  revalidatePath('/admin/financeiro/distribuicao')
}

export async function deleteFixedCost(id: string) {
  await requireAdmin()
  await prisma.allocationFixedCost.delete({ where: { id } })
  revalidatePath('/admin/financeiro/distribuicao')
}

// ── Allocation Rules ──────────────────────────────────────────────────────────

export async function createAllocationRule(data: { name: string; percent: string; color: string }) {
  await requireAdmin()
  const count = await prisma.allocationRule.count()
  await prisma.allocationRule.create({
    data: { name: data.name.trim(), percent: parseFloat(data.percent), color: data.color, order: count + 1 },
  })
  revalidatePath('/admin/financeiro/distribuicao')
}

export async function updateAllocationRule(id: string, data: { name: string; percent: string; color: string }) {
  await requireAdmin()
  await prisma.allocationRule.update({
    where: { id },
    data: { name: data.name.trim(), percent: parseFloat(data.percent), color: data.color },
  })
  revalidatePath('/admin/financeiro/distribuicao')
}

export async function deleteAllocationRule(id: string) {
  await requireAdmin()
  await prisma.allocationRule.delete({ where: { id } })
  revalidatePath('/admin/financeiro/distribuicao')
}
