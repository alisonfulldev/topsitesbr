import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SubscriptionPageClient } from './_components/SubscriptionPageClient'

export default async function AssinaturaPage({
  params,
}: {
  params: { id: string }
}) {
  const [client, plans] = await Promise.all([
    prisma.client.findUnique({
      where: { id: params.id },
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.plan.findMany({ orderBy: { price: 'asc' } }),
  ])

  if (!client) notFound()

  const sub = client.subscriptions[0] ?? null

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/clientes" className="text-sm text-gray-500 hover:text-gray-700">
          ← Clientes
        </Link>
        <span className="text-gray-300">/</span>
        <Link
          href={`/admin/clientes/${client.id}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {client.name}
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium">Assinatura</span>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Assinatura — {client.name}
      </h2>

      <SubscriptionPageClient
        clientId={client.id}
        clientName={client.name}
        subscription={
          sub
            ? {
                id: sub.id,
                status: sub.status,
                planId: sub.planId,
                planName: sub.plan.name,
                planPrice: Number(sub.plan.price),
                nextDueDate: sub.nextDueDate?.toISOString() ?? null,
                planActivatedAt: sub.planActivatedAt.toISOString(),
                asaasSubscriptionId: sub.asaasSubscriptionId,
              }
            : null
        }
        plans={plans.map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          monthlyChangesIncluded: p.monthlyChangesIncluded,
          allowedChangeTypes: p.allowedChangeTypes,
        }))}
      />
    </div>
  )
}
