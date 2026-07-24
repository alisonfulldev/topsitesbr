'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/password'

export async function changePassword(data: {
  currentPassword?: string
  newPassword: string
  confirmPassword: string
}): Promise<{ error?: string; success?: boolean }> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { error: 'Sessão inválida. Faça login novamente.' }
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return { error: 'Usuário não encontrado.' }
  }

  // If not a forced change, validate current password
  if (!user.mustChangePassword) {
    if (!data.currentPassword) {
      return { error: 'Informe a senha atual.' }
    }
    const valid = await verifyPassword(data.currentPassword, user.passwordHash)
    if (!valid) {
      return { error: 'Senha atual incorreta.' }
    }
  }

  if (data.newPassword.length < 8) {
    return { error: 'A nova senha deve ter pelo menos 8 caracteres.' }
  }

  if (data.newPassword !== data.confirmPassword) {
    return { error: 'As senhas não coincidem.' }
  }

  const newHash = await hashPassword(data.newPassword)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newHash,
      mustChangePassword: false,
    },
  })

  return { success: true }
}
