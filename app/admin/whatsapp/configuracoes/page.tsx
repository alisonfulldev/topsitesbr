import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getWaConfig } from '@/lib/whatsapp/config'
import { getConnection, whatsappConfigured } from '@/lib/whatsapp/cloud-api'
import { aiConfigured } from '@/lib/whatsapp/ai'
import { ConfigForm } from './ConfigForm'
import { SyncCard } from './SyncCard'

export const dynamic = 'force-dynamic'

function readSync(value: string | undefined) {
  if (!value) return null
  try {
    return JSON.parse(value) as { at: string; requestId: string | null }
  } catch {
    return null
  }
}

export default async function WhatsappConfigPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const [config, syncRows, contacts, historyMessages, connection] = await Promise.all([
    getWaConfig(),
    prisma.systemSetting.findMany({ where: { key: { in: ['whatsapp_sync_smb_app_state_sync', 'whatsapp_sync_history'] } } }),
    prisma.waContact.count(),
    prisma.waMessage.count({ where: { status: 'historico' } }),
    getConnection(),
  ])
  const sync = (k: string) => readSync(syncRows.find((r) => r.key === k)?.value)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://SEU_DOMINIO'

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/whatsapp" className="text-sm text-gray-500 hover:text-gray-800">← WhatsApp</Link>
      <h2 className="mb-5 mt-2 text-xl font-semibold text-gray-900">Configurações do WhatsApp com IA</h2>
      <SyncCard
        webhookUrl={appUrl.replace(/\/$/, '') + '/api/webhooks/whatsapp'}
        whatsappReady={await whatsappConfigured()}
        connection={connection ? { displayPhone: connection.displayPhone, connectedAt: connection.connectedAt, tokenExpiresAt: connection.tokenExpiresAt } : null}
        aiReady={aiConfigured()}
        contactsSync={sync('whatsapp_sync_smb_app_state_sync')}
        historySync={sync('whatsapp_sync_history')}
        contacts={contacts}
        historyMessages={historyMessages}
      />
      <ConfigForm initial={config} />
    </div>
  )
}
