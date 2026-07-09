import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AssinaturaPageClient } from './_components/AssinaturaPageClient'
import Link from 'next/link'

export default async function PainelAssinaturaPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { clientId: true },
  })

  if (!user?.clientId) redirect('/painel')

  const [subscriptionRaw, plans] = await Promise.all([
    prisma.subscription.findFirst({
      where: { clientId: user.clientId, status: { not: 'canceled' } },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.plan.findMany({ orderBy: { price: 'asc' } }),
  ])

  if (!subscriptionRaw) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white px-6 py-4">
          <h1 className="text-lg font-semibold text-gray-900">Minha Assinatura</h1>
        </header>
        <main className="p-6 max-w-xl">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-sm mb-4">Você ainda não possui uma assinatura ativa.</p>
            <Link href="/painel" className="text-indigo-600 text-sm hover:underline">
              ← Voltar ao painel
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const subscription = {
    id: subscriptionRaw.id,
    status: subscriptionRaw.status,
    planId: subscriptionRaw.planId,
    planName: subscriptionRaw.plan.name,
    planPrice: Number(subscriptionRaw.plan.price),
    nextDueDate: subscriptionRaw.nextDueDate?.toISOString() ?? null,
    planActivatedAt: subscriptionRaw.planActivatedAt.toISOString(),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4 flex items-center gap-4">
        <Link href="/painel" className="text-sm text-gray-500 hover:text-gray-700">
          ← Painel
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Minha Assinatura</h1>
      </header>
      <main className="p-6 max-w-3xl">
        <AssinaturaPageClient
          subscription={subscription}
          plans={plans.map((p) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            monthlyChangesIncluded: p.monthlyChangesIncluded,
            prioritySupport: p.prioritySupport,
            allowedChangeTypes: p.allowedChangeTypes,
          }))}
        />
      </main>
    </div>
  )
}
