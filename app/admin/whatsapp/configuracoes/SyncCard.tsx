'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Card, buttonVariantClass } from '@/components/ui'
import { requestSyncAction } from '../actions'

interface SyncInfo {
  at: string
  requestId: string | null
}

interface Props {
  webhookUrl: string
  whatsappReady: boolean
  connection: { displayPhone: string | null; connectedAt: string; tokenExpiresAt: string | null } | null
  aiReady: boolean
  contactsSync: SyncInfo | null
  historySync: SyncInfo | null
  contacts: number
  historyMessages: number
}

const fmt = (iso: string) => new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

export function SyncCard({ webhookUrl, whatsappReady, connection, aiReady, contactsSync, historySync, contacts, historyMessages }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)

  const sync = (kind: 'smb_app_state_sync' | 'history') => {
    const what = kind === 'history' ? 'o HISTÓRICO de conversas (até 6 meses)' : 'os CONTATOS da agenda'
    if (!window.confirm(`Pedir à Meta ${what}? Isso só pode ser feito UMA vez e só nas primeiras 24h depois de conectar o número.`)) return
    start(async () => {
      const res = await requestSyncAction(kind)
      setMessage(res.ok ? { text: 'Pedido aceito. Os dados chegam pelo webhook nos próximos minutos.' } : { text: res.error, error: true })
      if (res.ok) router.refresh()
    })
  }

  return (
    <Card className="mb-5">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">Conexão</h3>
      <ul className="mb-4 space-y-1 text-sm">
        <li>
          {whatsappReady ? '✅' : '❌'} WhatsApp{' '}
          {connection
            ? <>conectado: {connection.displayPhone ?? 'número'} desde {fmt(connection.connectedAt)}</>
            : whatsappReady ? 'configurado pelas variáveis do servidor' : 'ainda não conectado'}
          {!whatsappReady && (
            <Link href="/admin/whatsapp/conectar" className={buttonVariantClass('primary', 'sm') + ' ml-2'}>Conectar número</Link>
          )}
        </li>
        {connection?.tokenExpiresAt && (
          <li className={new Date(connection.tokenExpiresAt).getTime() - Date.now() < 10 * 86_400_000 ? 'text-red-700' : 'text-gray-600'}>
            Acesso da Meta vence em {fmt(connection.tokenExpiresAt)}. Antes disso, gere um token permanente (usuário do sistema) ou conecte de novo.
          </li>
        )}
        <li>{aiReady ? '✅' : '❌'} IA (Claude) {aiReady ? 'configurada' : '— falta ANTHROPIC_API_KEY no servidor'}</li>
        <li className="text-gray-600">Webhook: <code className="rounded bg-gray-100 px-1 text-xs">{webhookUrl}</code></li>
        <li className="text-xs text-gray-500">Campos do webhook a assinar: messages, smb_message_echoes, history, smb_app_state_sync</li>
      </ul>

      <h3 className="mb-1 text-sm font-semibold text-gray-900">Importar agenda e histórico (uma vez só)</h3>
      <p className="mb-3 text-xs text-gray-500">
        A Meta permite pedir isso uma única vez, nas primeiras 24h depois de conectar o número em coexistência. Peça os contatos primeiro e depois o histórico.
        A IA analisa os contatos aos poucos, alguns por minuto. Hoje: {contacts} contato(s), {historyMessages} mensagem(ns) de histórico.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" loading={pending} disabled={!whatsappReady || !!contactsSync} onClick={() => sync('smb_app_state_sync')}>
          {contactsSync ? `Contatos pedidos em ${fmt(contactsSync.at)}` : 'Importar contatos'}
        </Button>
        <Button size="sm" variant="secondary" loading={pending} disabled={!whatsappReady || !!historySync} onClick={() => sync('history')}>
          {historySync ? `Histórico pedido em ${fmt(historySync.at)}` : 'Importar histórico'}
        </Button>
      </div>
      {message && <p role="status" className={'mt-2 text-xs ' + (message.error ? 'text-red-700' : 'text-green-700')}>{message.text}</p>}
    </Card>
  )
}
