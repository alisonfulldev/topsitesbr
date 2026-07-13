'use server'

import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendNotification } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

async function requireAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions)
  return session?.user.role === 'admin'
}

const PROMO_SCHEMA = z.object({
  title: z.string().min(1, 'Título obrigatório.'),
  description: z.string().optional(),
  productId: z.string().optional(),
  discountType: z.enum(['percent', 'fixed']),
  discountValue: z.coerce.number().positive('Desconto deve ser positivo.'),
  startDate: z.string().min(1, 'Data de início obrigatória.'),
  endDate: z.string().min(1, 'Data de fim obrigatória.'),
  active: z.coerce.boolean(),
})

type PromoInput = z.infer<typeof PROMO_SCHEMA>

function parseForm(formData: FormData): PromoInput | { error: string } {
  const raw = {
    title: formData.get('title'),
    description: formData.get('description') ?? undefined,
    productId: (formData.get('productId') as string | null) || undefined,
    discountType: formData.get('discountType'),
    discountValue: formData.get('discountValue'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    active: formData.get('active') === 'true',
  }
  const parsed = PROMO_SCHEMA.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  return parsed.data
}

async function notifyAllEligibleClients(title: string, description: string | null | undefined) {
  const clients = await prisma.client.findMany({
    where: {
      subscriptions: { some: { status: 'active' } },
    },
    select: { id: true },
  })

  const message = description
    ? `${title} — ${description}`
    : title

  await Promise.all(
    clients.map((c) =>
      sendNotification(c.id, `🎉 Nova promoção: ${title}`, message, 'painel', 'promotion'),
    ),
  )
}

export async function createPromocao(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  if (!(await requireAdmin())) return { error: 'Não autorizado.' }

  const data = parseForm(formData)
  if ('error' in data) return { error: data.error }

  const promo = await prisma.promotion.create({
    data: {
      title: data.title,
      description: data.description || null,
      productId: data.productId || null,
      discountType: data.discountType,
      discountValue: data.discountValue,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      active: data.active,
    },
  })

  if (promo.active) {
    await notifyAllEligibleClients(promo.title, promo.description)
  }

  revalidatePath('/admin/promocoes')
  return { success: true }
}

export async function updatePromocao(
  id: string,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  if (!(await requireAdmin())) return { error: 'Não autorizado.' }

  const data = parseForm(formData)
  if ('error' in data) return { error: data.error }

  const previous = await prisma.promotion.findUnique({ where: { id } })

  const promo = await prisma.promotion.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description || null,
      productId: data.productId || null,
      discountType: data.discountType,
      discountValue: data.discountValue,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      active: data.active,
    },
  })

  // Notify clients if promotion just became active
  if (!previous?.active && promo.active) {
    await notifyAllEligibleClients(promo.title, promo.description)
  }

  revalidatePath('/admin/promocoes')
  return { success: true }
}

export async function togglePromocaoActive(
  id: string,
  active: boolean,
): Promise<{ error?: string }> {
  if (!(await requireAdmin())) return { error: 'Não autorizado.' }

  const previous = await prisma.promotion.findUnique({ where: { id } })
  const promo = await prisma.promotion.update({
    where: { id },
    data: { active },
  })

  if (!previous?.active && promo.active) {
    await notifyAllEligibleClients(promo.title, promo.description)
  }

  revalidatePath('/admin/promocoes')
  return {}
}

export async function deletePromocao(id: string): Promise<{ error?: string }> {
  if (!(await requireAdmin())) return { error: 'Não autorizado.' }
  await prisma.promotion.delete({ where: { id } })
  revalidatePath('/admin/promocoes')
  return {}
}
