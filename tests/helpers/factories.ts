import { prisma } from '@/lib/prisma'

// Dados de teste mínimos (clientes, planos, assinaturas, faturas)

let n = 0

export async function plan(name = 'Site no Ar', price = 29) {
  return prisma.plan.upsert({
    where: { name },
    update: {},
    create: { name, price, monthlyChangesIncluded: 0, allowedChangeTypes: '', changeDeadlineDays: 15, discountPercent: 0 },
  })
}

export async function client(data: Partial<{ name: string; email: string; phone: string; document: string; entryFlow: string; monthlyPrice: number; asaasCustomerId: string }> = {}) {
  n++
  return prisma.client.create({
    data: {
      name: data.name ?? `Cliente Teste ${n}`,
      email: data.email ?? `cliente${n}@teste.local`,
      phone: data.phone ?? '11987654321',
      document: data.document ?? '52998224725',
      referralCode: `REF${n}${Date.now().toString(36)}`,
      entryFlow: data.entryFlow ?? 'whatsapp',
      monthlyPrice: data.monthlyPrice,
      asaasCustomerId: data.asaasCustomerId,
    },
  })
}

export const days = (n: number) => new Date(Date.now() + n * 86_400_000)
export const ymd = (d: Date) => d.toISOString().slice(0, 10)
