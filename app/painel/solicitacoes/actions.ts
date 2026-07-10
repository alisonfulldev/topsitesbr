'use server'

import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPaymentProvider } from '@/lib/payments/provider'
import { uploadTicketAttachment } from '@/lib/storage'
import { sendNotification } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'
import { ChangeType } from '@prisma/client'

// ── Types ────────────────────────────────────────────────────────────────────

const ALTERACAO_TYPES = ['texto', 'imagem', 'texto_e_imagem'] as const
type AlteracaoType = (typeof ALTERACAO_TYPES)[number]

const TICKET_SCHEMA = z.object({
  changeType: z.enum([
    'correcao',
    'texto',
    'imagem',
    'texto_e_imagem',
    'nova_secao',
    'nova_pagina',
  ]),
  siteId: z.string().min(1, 'Site obrigatório.'),
  textContent: z.string().optional(),
})

// Product name map for avulsa charges
const PRODUCT_NAME: Record<string, string> = {
  texto: 'Alteração de Texto (avulsa)',
  imagem: 'Alteração de Imagem (avulsa)',
  texto_e_imagem: 'Alteração de Texto e Imagem (avulsa)',
  nova_secao: 'Nova Seção',
  nova_pagina: 'Nova Página',
}

const CHANGE_TYPE_LABEL: Record<string, string> = {
  correcao: 'Correção no site',
  texto: 'Alteração de Texto',
  imagem: 'Alteração de Imagem',
  texto_e_imagem: 'Alteração de Texto e Imagem',
  nova_secao: 'Nova Seção',
  nova_pagina: 'Nova Página',
}

// ── Helper ───────────────────────────────────────────────────────────────────

async function getClientId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') return null
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { clientId: true },
  })
  return user?.clientId ?? null
}

// ── Action ───────────────────────────────────────────────────────────────────

export async function createTicket(
  formData: FormData,
): Promise<{ error?: string; success?: boolean; message?: string }> {
  const clientId = await getClientId()
  if (!clientId) return { error: 'Não autorizado.' }

  // ── 1. Parse & validate fields ──────────────────────────────────────────
  const raw = {
    changeType: formData.get('changeType') as string,
    siteId: formData.get('siteId') as string,
    textContent: (formData.get('textContent') as string | null) ?? undefined,
  }

  const parsed = TICKET_SCHEMA.safeParse(raw)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { error: first?.message ?? 'Dados inválidos.' }
  }

  const { changeType, siteId, textContent } = parsed.data
  const needsText = ['correcao', 'texto', 'texto_e_imagem', 'nova_secao', 'nova_pagina'].includes(changeType)
  const needsImage = ['imagem', 'texto_e_imagem'].includes(changeType)
  const imageOptional = ['nova_secao', 'nova_pagina'].includes(changeType)

  if (needsText && !textContent?.trim()) {
    return { error: 'O campo de descrição/texto é obrigatório para este tipo de solicitação.' }
  }

  const imageFile = formData.get('image') as File | null
  const hasImage = imageFile && imageFile.size > 0

  if (needsImage && !imageOptional && !hasImage) {
    return { error: 'Upload de imagem obrigatório para este tipo de solicitação.' }
  }

  // ── 2. Validate site belongs to client ──────────────────────────────────
  const site = await prisma.site.findUnique({
    where: { id: siteId, clientId },
    select: { id: true },
  })
  if (!site) return { error: 'Site não encontrado.' }

  // ── 3. Get active subscription + plan ───────────────────────────────────
  const subscription = await prisma.subscription.findFirst({
    where: { clientId, status: { not: 'canceled' } },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  })

  if (!subscription) return { error: 'Você não possui uma assinatura ativa.' }

  const { plan } = subscription
  const allowedTypes = plan.allowedChangeTypes.split(',').filter(Boolean)

  // ── 4. Upload image if provided ──────────────────────────────────────────
  let attachmentUrl: string | null = null
  if (hasImage) {
    try {
      const buffer = Buffer.from(await imageFile!.arrayBuffer())
      attachmentUrl = await uploadTicketAttachment(
        imageFile!.name,
        buffer,
        imageFile!.type || 'image/jpeg',
      )
    } catch {
      return { error: 'Erro ao fazer upload da imagem. Tente novamente.' }
    }
  }

  // ── 5. Determine billing rules ───────────────────────────────────────────
  const isCorrecao = changeType === 'correcao'
  const isAlteracao = (ALTERACAO_TYPES as readonly string[]).includes(changeType)
  const isFixedCharge = ['nova_secao', 'nova_pagina'].includes(changeType)

  let isExtraPaid = false
  let productName: string | null = null

  if (isCorrecao) {
    // Never billed, never counts against monthly limit
    isExtraPaid = false
  } else if (isFixedCharge) {
    // nova_secao / nova_pagina: always billed
    isExtraPaid = true
    productName = PRODUCT_NAME[changeType]
  } else if (isAlteracao) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const monthlyUsed = await prisma.ticket.count({
      where: {
        clientId,
        changeType: { in: ALTERACAO_TYPES as unknown as ChangeType[] },
        createdAt: { gte: startOfMonth },
      },
    })

    const typeIsAllowed = allowedTypes.includes(changeType)
    isExtraPaid = !typeIsAllowed || monthlyUsed >= plan.monthlyChangesIncluded
    if (isExtraPaid) productName = PRODUCT_NAME[changeType]
  }

  const isPriority = plan.prioritySupport

  // ── 6. Create Ticket ─────────────────────────────────────────────────────
  const ticket = await prisma.ticket.create({
    data: {
      clientId,
      siteId,
      changeType: changeType as ChangeType,
      textContent: textContent?.trim() || null,
      attachmentUrl,
      status: 'open',
      isExtraPaid,
      isPriority,
    },
  })

  // ── 7. Extra paid: Order + single charge ─────────────────────────────────
  if (isExtraPaid && productName) {
    const product = await prisma.product.findFirst({ where: { name: productName } })
    if (!product) return { error: `Produto "${productName}" não encontrado. Contate o suporte.` }

    const basePrice = Number(product.price)
    const discount = plan.discountPercent / 100
    const finalPrice = Math.round(basePrice * (1 - discount) * 100) / 100

    await prisma.order.create({
      data: {
        clientId,
        productId: product.id,
        amount: finalPrice,
        status: 'pending',
      },
    })

    const client = await prisma.client.findUnique({ where: { id: clientId } })
    if (client) {
      const provider = getPaymentProvider()
      const { customerId } = await provider.createCustomer({
        name: client.name,
        email: client.email,
        document: client.document,
        phone: client.phone,
      })
      await provider.createSingleCharge({
        customerId,
        description: productName,
        price: finalPrice,
      })
    }
  }

  // ── 8. Notify client ──────────────────────────────────────────────────────
  const label = CHANGE_TYPE_LABEL[changeType] ?? changeType
  const prazo = plan.changeDeadlineDays

  let notifMessage: string
  if (isCorrecao) {
    notifMessage = `Sua correção foi recebida e será analisada em até ${prazo} dia${prazo !== 1 ? 's' : ''} útil${prazo !== 1 ? 'is' : ''}.`
  } else if (isExtraPaid) {
    const product = isFixedCharge || productName
      ? await prisma.product.findFirst({ where: { name: productName ?? '' } })
      : null
    const basePrice = product ? Number(product.price) : 0
    const discount = plan.discountPercent / 100
    const finalPrice = Math.round(basePrice * (1 - discount) * 100) / 100
    const discountNote =
      plan.discountPercent > 0
        ? ` (${plan.discountPercent}% de desconto do seu plano aplicado)`
        : ''
    notifMessage = `Sua solicitação de "${label}" foi recebida. Valor: R$${finalPrice.toFixed(2).replace('.', ',')}${discountNote}. Prazo de execução: até ${prazo} dia${prazo !== 1 ? 's' : ''} útil${prazo !== 1 ? 'is' : ''} após confirmação do pagamento.`
  } else {
    notifMessage = `Sua solicitação de "${label}" foi recebida e está incluída no seu plano. Prazo de execução: até ${prazo} dia${prazo !== 1 ? 's' : ''} útil${prazo !== 1 ? 'is' : ''}.`
  }

  await sendNotification(clientId, `Solicitação recebida: ${label}`, notifMessage)

  revalidatePath('/painel/solicitacoes')
  revalidatePath('/painel')

  return {
    success: true,
    message: notifMessage,
  }
}
