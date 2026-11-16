import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { verifyPaymentToken } from '@/lib/pix-payment-link'
import { getMonthlyPix } from '@/lib/monthly-plan-service'
import { formatBRL, subscriptionPrice } from '@/lib/monthly-plan'
import { PublicPixPay } from './PublicPixPay'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Pagar mensalidade — TopSite',
  robots: { index: false, follow: false, nocache: true },
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black px-4 py-3">
        <div className="mx-auto flex max-w-xl items-center">
          <Image src="/logo.png" alt="TopSite" width={32} height={32} className="h-8 w-8 object-contain" />
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-8">{children}</main>
    </div>
  )
}

function Notice({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-600">{text}</p>
    </div>
  )
}

// Página pública de pagamento da mensalidade por Pix (link assinado, sem login)
export default async function PayPage({ params }: { params: { token: string } }) {
  const subscriptionId = verifyPaymentToken(params.token)
  if (!subscriptionId) notFound()

  const sub = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: { select: { price: true } }, client: { select: { name: true } } },
  })
  if (!sub) notFound()

  const firstName = sub.client.name.split(' ')[0]
  const price = subscriptionPrice(sub)
  const openPix = !!sub.pixAutomaticAuthorizationId && !sub.asaasSubscriptionId && ['pending', 'active', 'overdue'].includes(sub.status)

  if (sub.status === 'canceled') {
    return <Shell><Notice title="Assinatura encerrada" text="Esta assinatura não está mais ativa." /></Shell>
  }

  if (openPix) {
    const pix = await getMonthlyPix(sub.clientId).catch(() => null)
    if (pix && pix.status !== 'ACTIVE') {
      return (
        <Shell>
          <p className="text-sm text-gray-500">Olá, {firstName}!</p>
          <h1 className="mt-1 mb-5 text-2xl font-bold text-gray-900">Pague sua mensalidade</h1>
          <PublicPixPay
            token={params.token}
            initialPix={pix}
            amount={formatBRL(price)}
            dueDate={sub.nextDueDate ? sub.nextDueDate.toLocaleDateString('pt-BR') : null}
            overdue={sub.status === 'overdue'}
          />
        </Shell>
      )
    }
    return <Shell><Notice title="Pagamento confirmado ✓" text="Recebemos o pagamento. Obrigado! As próximas mensalidades serão debitadas automaticamente, se você autorizou no banco." /></Shell>
  }

  if (sub.pixAutomaticAuthorizationId && sub.asaasSubscriptionId) {
    return <Shell><Notice title="Tudo em dia ✓" text={`O débito automático por Pix está ativo. A mensalidade de ${formatBRL(price)} é paga automaticamente todo mês.`} /></Shell>
  }

  const due = sub.nextDueDate ? sub.nextDueDate.toLocaleDateString('pt-BR') : null
  return (
    <Shell>
      <Notice
        title="Nenhuma mensalidade em aberto"
        text={due ? `Sua próxima mensalidade (${formatBRL(price)}) vence em ${due}. O Pix fica disponível neste mesmo link alguns dias antes do vencimento.` : 'Não há pagamento pendente no momento.'}
      />
    </Shell>
  )
}
