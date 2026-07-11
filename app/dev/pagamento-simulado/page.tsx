import { prisma } from '@/lib/prisma'
import { SimuladorClient } from './_components/SimuladorClient'

export default async function PagamentoSimuladoPage() {
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Não disponível em produção.</p>
      </div>
    )
  }

  const [invoices, orders] = await Promise.all([
    prisma.invoice.findMany({
      where: { asaasChargeId: { not: null } },
      include: {
        subscription: {
          include: {
            client: { select: { name: true } },
            plan: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.order.findMany({
      where: { asaasChargeId: { not: null } },
      include: {
        client: { select: { name: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ])

  const invoiceRows = invoices.map((inv) => ({
    id: inv.id,
    chargeId: inv.asaasChargeId!,
    clientName: inv.subscription.client.name,
    description: `Plano ${inv.subscription.plan.name}`,
    amount: Number(inv.amount),
    status: inv.status,
  }))

  const orderRows = orders.map((o) => ({
    id: o.id,
    chargeId: o.asaasChargeId!,
    clientName: o.client.name,
    description: o.product.name,
    amount: Number(o.amount),
    status: o.status,
  }))

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Simulador de Pagamentos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ferramenta de desenvolvimento — simula eventos que o Asaas enviaria via webhook.
          </p>
        </div>
        <SimuladorClient invoiceRows={invoiceRows} orderRows={orderRows} />
      </div>
    </div>
  )
}
