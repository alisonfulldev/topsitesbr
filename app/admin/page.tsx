import { checkOverdueSubscriptions } from '@/lib/payments/webhook-handlers'

export default async function AdminPage() {
  // Verifica inadimplência e envia e-mails da régua de cobrança
  await checkOverdueSubscriptions()

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard</h2>
      <p className="text-sm text-gray-500">
        Bem-vindo ao painel administrativo. Use o menu lateral para navegar.
      </p>
    </div>
  )
}
