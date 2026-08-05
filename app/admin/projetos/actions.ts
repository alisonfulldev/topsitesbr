'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ProjectLabel, ProjectStatus } from '@prisma/client'

function adminOnly() {
  return getServerSession(authOptions).then((s) => {
    if (!s || s.user.role !== 'admin') throw new Error('Acesso não autorizado.')
  })
}

export async function createProject(data: {
  title: string
  description?: string
  label: ProjectLabel
  dueDate: string
}): Promise<{ error?: string; id?: string }> {
  try {
    await adminOnly()
    const project = await prisma.project.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        label: data.label,
        status: 'a_fazer',
        dueDate: new Date(data.dueDate),
      },
    })
    revalidatePath('/admin/projetos')
    return { id: project.id }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Erro ao criar projeto.' }
  }
}

export async function updateProject(
  id: string,
  data: {
    title: string
    description?: string
    label: ProjectLabel
    dueDate: string
  },
): Promise<{ error?: string; success?: boolean }> {
  try {
    await adminOnly()
    await prisma.project.update({
      where: { id },
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        label: data.label,
        dueDate: new Date(data.dueDate),
      },
    })
    revalidatePath('/admin/projetos')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Erro ao atualizar projeto.' }
  }
}

export async function moveProject(
  id: string,
  status: ProjectStatus,
): Promise<{ error?: string; success?: boolean }> {
  try {
    await adminOnly()
    await prisma.project.update({ where: { id }, data: { status } })
    revalidatePath('/admin/projetos')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Erro ao mover projeto.' }
  }
}

export async function deleteProject(id: string): Promise<{ error?: string; success?: boolean }> {
  try {
    await adminOnly()
    await prisma.project.delete({ where: { id } })
    revalidatePath('/admin/projetos')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Erro ao excluir projeto.' }
  }
}
