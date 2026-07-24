'use server'

import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { APP_URL } from '@/lib/config'
import { sendPasswordResetEmail } from '@/lib/notifications'

export async function requestPasswordReset(
  email: string,
): Promise<{ success: true }> {
  const GENERIC_SUCCESS = { success: true } as const

  const normalizedEmail = email.trim().toLowerCase()

  // Rate limiting: no more than 3 tokens in the last 15 minutes per email
  const user = await prisma.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    select: { id: true, email: true },
  })

  if (user) {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
    const recentTokenCount = await prisma.passwordResetToken.count({
      where: {
        userId: user.id,
        createdAt: { gte: fifteenMinutesAgo },
      },
    })

    if (recentTokenCount >= 3) {
      // Silently return success — do not reveal rate limiting to the caller
      return GENERIC_SUCCESS
    }

    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    })

    const resetLink = `${APP_URL}/redefinir-senha?token=${rawToken}`

    await sendPasswordResetEmail(user.email, resetLink)
  }

  return GENERIC_SUCCESS
}
