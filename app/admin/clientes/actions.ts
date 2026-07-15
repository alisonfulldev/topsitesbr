'use server'

import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { generateReferralCode } from '@/lib/referral'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const clientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  document: z.string().optional(),
})

export async function getClients() {
  const clients = await prisma.client.findMany({
    include: {
      sites: { select: { id: true } },
      subscriptions: {
        include: { plan: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return clients.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    referralCode: c.referralCode,
    sitesCount: c.sites.length,
    planName: c.subscriptions[0]?.plan.name ?? null,
    createdAt: c.createdAt.toISOString(),
  }))
}

export async function createClient(data: {
  name: string
  email: string
  phone?: string
  document?: string
  referralCode?: string
  createUserPassword?: string
  siteEntryFee?: number
}): Promise<{ error?: string; success?: boolean; clientId?: string }> {
  const parsed = clientSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const email = data.email.toLowerCase().trim()
  const existingClient = await prisma.client.findUnique({ where: { email } })
  if (existingClient) {
    return { error: 'Já existe um cliente com este e-mail.' }
  }

  let referrerId: string | null = null
  if (data.referralCode?.trim()) {
    const referrer = await prisma.client.findFirst({
      where: { referralCode: data.referralCode.toUpperCase().trim() },
      select: { id: true },
    })
    if (!referrer) {
      return { error: 'Código de indicação não encontrado.' }
    }
    referrerId = referrer.id
  }

  const newReferralCode = generateReferralCode(data.name)

  const client = await prisma.client.create({
    data: {
      name: data.name.trim(),
      email,
      phone: data.phone?.trim() || null,
      document: data.document?.trim() || null,
      referralCode: newReferralCode,
      siteEntryFee: data.siteEntryFee != null ? data.siteEntryFee : null,
    },
  })

  if (referrerId) {
    await prisma.referral.create({
      data: {
        referrerClientId: referrerId,
        referredClientId: client.id,
        status: 'confirmado',
      },
    })
  }

  if (data.createUserPassword) {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (!existingUser) {
      const passwordHash = await hashPassword(data.createUserPassword)
      await prisma.user.create({
        data: {
          name: client.name,
          email,
          passwordHash,
          role: 'client',
          clientId: client.id,
        },
      })
    }
  }

  revalidatePath('/admin/clientes')
  return { success: true, clientId: client.id }
}

export async function updateClient(
  id: string,
  data: { name: string; email: string; phone?: string; document?: string; siteEntryFee?: number }
): Promise<{ error?: string; success?: boolean }> {
  const parsed = clientSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const email = data.email.toLowerCase().trim()
  const conflict = await prisma.client.findFirst({
    where: { email, NOT: { id } },
  })
  if (conflict) {
    return { error: 'Já existe outro cliente com este e-mail.' }
  }

  await prisma.client.update({
    where: { id },
    data: {
      name: data.name.trim(),
      email,
      phone: data.phone?.trim() || null,
      document: data.document?.trim() || null,
      ...(data.siteEntryFee !== undefined && { siteEntryFee: data.siteEntryFee }),
    },
  })

  revalidatePath('/admin/clientes')
  revalidatePath(`/admin/clientes/${id}`)
  return { success: true }
}

export async function lookupReferralCode(
  code: string
): Promise<{ found: boolean; referrerName?: string }> {
  if (!code.trim()) return { found: false }
  const client = await prisma.client.findFirst({
    where: { referralCode: code.toUpperCase().trim() },
    select: { name: true },
  })
  if (!client) return { found: false }
  return { found: true, referrerName: client.name }
}

export async function getRecentReferralCodes(): Promise<
  Array<{ code: string; clientName: string; lastClickAt: string }>
> {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const clicks = await prisma.referralClick.findMany({
    where: { clickedAt: { gte: sevenDaysAgo } },
    orderBy: { clickedAt: 'desc' },
    distinct: ['referralCode'],
    take: 20,
  })

  if (clicks.length === 0) return []

  const codes = clicks.map((c) => c.referralCode)
  const clients = await prisma.client.findMany({
    where: { referralCode: { in: codes } },
    select: { referralCode: true, name: true },
  })

  const clientMap = Object.fromEntries(clients.map((c) => [c.referralCode, c.name]))

  return clicks.map((c) => ({
    code: c.referralCode,
    clientName: clientMap[c.referralCode] ?? 'Desconhecido',
    lastClickAt: c.clickedAt.toISOString(),
  }))
}
