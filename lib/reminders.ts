import { prisma } from '@/lib/prisma'
import { sendLoyaltyReminderEmail, buildHtml } from '@/lib/notifications'
import { sendEmail } from '@/lib/integrations/resend'
import { APP_URL } from '@/lib/config'

async function sendBasicDueDateReminder(
  email: string,
  clientName: string,
  dueDateStr: string,
): Promise<void> {
  const firstName = clientName.split(' ')[0]
  const subject = `Seu plano Site no Ar vence em 2 dias`
  const message = `Olá, ${firstName}! Seu plano Site no Ar vence no dia ${dueDateStr}. Certifique-se de que o pagamento está em dia para manter seu site no ar sem interrupção.`
  const html = buildHtml(subject, message, 'due-date-reminder', '', APP_URL + '/painel/assinatura', 'Ver minha assinatura')
  try {
    await sendEmail({ to: email, subject, html })
  } catch (err) {
    console.error('[sendBasicDueDateReminder] Falha:', err instanceof Error ? err.message : err)
  }
}

// Um pagamento é "pontual" se o invoice foi pago antes de receber o evento PAYMENT_OVERDUE
// do Asaas. O campo overdueDay0SentAt é setado quando esse evento chega — se for null,
// o pagamento foi confirmado antes de atrasar.
export async function countConsecutiveOnTimeMonths(subscriptionId: string): Promise<number> {
  const invoices = await prisma.invoice.findMany({
    where: { subscriptionId, status: 'paid' },
    orderBy: { dueDate: 'desc' },
    select: { overdueDay0SentAt: true },
  })

  let count = 0
  for (const inv of invoices) {
    if (inv.overdueDay0SentAt === null) {
      count++
    } else {
      break
    }
  }
  return count
}

export async function sendDueDateReminders(): Promise<{ sent: number }> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDate = new Date(today)
  targetDate.setDate(targetDate.getDate() + 2)

  const nextDay = new Date(targetDate)
  nextDay.setDate(nextDay.getDate() + 1)

  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'active',
      nextDueDate: { gte: targetDate, lt: nextDay },
    },
    include: {
      plan: { select: { price: true } },
      client: { select: { name: true, email: true } },
    },
  })

  let sent = 0
  for (const sub of subscriptions) {
    const dueDateStr = sub.nextDueDate!.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo',
    })

    if (Number(sub.plan.price) >= 29) {
      // Plus: email com progresso de fidelidade
      const months = await countConsecutiveOnTimeMonths(sub.id)
      await sendLoyaltyReminderEmail(sub.client.email, sub.client.name, dueDateStr, months)
    } else {
      // Básico: lembrete simples de vencimento
      await sendBasicDueDateReminder(sub.client.email, sub.client.name, dueDateStr)
    }
    sent++
  }

  return { sent }
}
