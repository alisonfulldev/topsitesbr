import { prisma } from '@/lib/prisma'

// Phase 9: also dispatch email via Resend and WhatsApp via Cloud API
export async function sendNotification(
  clientId: string | null,
  title: string,
  message: string,
  channel: 'painel' | 'email' | 'whatsapp' = 'painel',
): Promise<void> {
  console.log(`[NOTIFICATION${clientId ? '' : ':ADMIN'}]`, title)
  await prisma.notification.create({
    data: { clientId, title, message, channel },
  })
}
