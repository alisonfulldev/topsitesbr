import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PedidosClient } from './_components/PedidosClient'

export default async function PedidosPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { id: true, name: true } },
      product: { select: { name: true } },
    },
  })

  const data = orders.map((o) => ({
    id: o.id,
    clientName: o.client.name,
    clientId: o.client.id,
    productName: o.product.name,
    amount: Number(o.amount),
    status: o.status as 'pending' | 'paid' | 'delivered',
    asaasChargeId: o.asaasChargeId,
    createdAt: o.createdAt.toISOString(),
  }))

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Pedidos</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upgrades, upsells e cobranças avulsas dos clientes
        </p>
      </div>

      <PedidosClient orders={data} />
    </div>
  )
}
