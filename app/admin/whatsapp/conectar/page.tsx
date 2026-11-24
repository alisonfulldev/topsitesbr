import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Card } from '@/components/ui'
import { getConnection, graphVersion } from '@/lib/whatsapp/cloud-api'
import { ConnectFlow } from './ConnectFlow'

export const dynamic = 'force-dynamic'

// IDs públicos do app da Meta e da configuração de cadastro incorporado (não são segredos)
const APP_ID = process.env.WHATSAPP_APP_ID || '1846957013192493'
const CONFIG_ID = process.env.WHATSAPP_ES_CONFIG_ID || '28270755765934797'

export default async function ConectarPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')
  const connection = await getConnection()

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/whatsapp/configuracoes" className="text-sm text-gray-500 hover:text-gray-800">← Configurações</Link>
      <h2 className="mb-2 mt-2 text-xl font-semibold text-gray-900">Conectar o número do WhatsApp</h2>
      <p className="mb-5 text-sm text-gray-600">
        O número continua no app WhatsApp Business do seu celular (coexistência) e passa a funcionar também com a IA.
      </p>

      {connection && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Já conectado: {connection.displayPhone ?? connection.phoneNumberId}. Conecte de novo só se o acesso venceu ou se trocou de número.
        </div>
      )}

      <Card className="mb-5">
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Antes de começar</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>Tenha o celular com o WhatsApp Business (versão 2.24.17 ou mais nova) por perto: a Meta vai pedir para confirmar por lá.</li>
          <li>Na janela da Meta, escolha <strong>conectar o seu app WhatsApp Business existente</strong> (não criar um número novo).</li>
          <li>Aceite compartilhar o <strong>histórico de conversas</strong>: é ele que a IA lê para saber em que pé está cada conversa.</li>
          <li>Logo depois, o sistema pede a agenda e o histórico (a Meta só aceita isso uma vez, nas primeiras 24h).</li>
        </ul>
      </Card>

      <ConnectFlow appId={APP_ID} configId={CONFIG_ID} version={graphVersion()} />
    </div>
  )
}
