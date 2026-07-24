'use server'

import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'

export async function resetPassword(
  token: string,
  newPassword: string,
  confirmPassword: string,
): Promise<{ success: true } | { error: string }> {
  // Validate passwords first
  if (newPassword.length < 8) {
    return { error: 'A senha deve ter pelo menos 8 caracteres.' }
  }
  if (newPassword !== confirmPassword) {
    return { error: 'As senhas não coincidem.' }
  }

  // Hash the token and look it up
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  })

  if (!resetToken || resetToken.usedAt !== null || resetToken.expiresAt < new Date()) {
    return { error: 'Token inválido ou expirado.' }
  }

  const newHash = await hashPassword(newPassword)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: newHash, mustChangePassword: false },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ])

  return { success: true }
}
