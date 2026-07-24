'use server'

import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { revalidatePath } from 'next/cache'

type Role = 'admin' | 'client'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'

function generateTempPassword(): string {
  return Array.from({ length: 12 }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('')
}

export async function getUsers() {
  const users = await prisma.user.findMany({
    include: {
      client: { select: { id: true, name: true } },
    },
    orderBy: { name: 'asc' },
  })
  return users.map((u) => ({
    ...u,
    mustChangePassword: u.mustChangePassword,
    lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }))
}

export async function getClientsForSelect() {
  return prisma.client.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  })
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  role: Role
  clientId?: string | null
}): Promise<{ error?: string; success?: boolean }> {
  if (!data.name.trim() || !data.email.trim() || !data.password || !data.role) {
    return { error: 'Preencha todos os campos obrigatórios.' }
  }

  const email = data.email.toLowerCase().trim()
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: 'E-mail já cadastrado.' }
  }

  const passwordHash = await hashPassword(data.password)

  await prisma.user.create({
    data: {
      name: data.name.trim(),
      email,
      passwordHash,
      role: data.role,
      clientId: data.clientId || null,
      mustChangePassword: true,
    },
  })

  revalidatePath('/admin/usuarios')
  return { success: true }
}

export async function toggleUserActive(id: string, active: boolean): Promise<void> {
  await prisma.user.update({ where: { id }, data: { active } })
  revalidatePath('/admin/usuarios')
}

export async function resetPassword(id: string): Promise<{ tempPassword: string }> {
  const tempPassword = generateTempPassword()
  const passwordHash = await hashPassword(tempPassword)
  await prisma.user.update({ where: { id }, data: { passwordHash, mustChangePassword: true } })
  revalidatePath('/admin/usuarios')
  return { tempPassword }
}
