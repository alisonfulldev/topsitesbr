import { prisma } from '@/lib/prisma'
import { sendLoyaltyReminderEmail } from '@/lib/notifications'

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

  // Benefício exclusivo do plano R$29
  const plusSubs = subscriptions.filter((s) => Number(s.plan.price) >= 29)

  let sent = 0
  for (const sub of plusSubs) {
    const months = await countConsecutiveOnTimeMonths(sub.id)
    const dueDateStr = sub.nextDueDate!.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo',
    })
    await sendLoyaltyReminderEmail(sub.client.email, sub.client.name, dueDateStr, months)
    sent++
  }

  return { sent }
}
