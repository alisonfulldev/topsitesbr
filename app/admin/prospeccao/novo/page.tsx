import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getProspectingConfig } from '@/lib/prospecting/config'
import { NewProspectForm } from './NewProspectForm'

export const dynamic = 'force-dynamic'

export default async function NovoProspectPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')
  const config = await getProspectingConfig()

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/prospeccao" className="text-sm text-gray-500 hover:text-gray-800">← Prospecção</Link>
      <h2 className="mb-1 mt-2 text-xl font-semibold text-gray-900">Novo prospect</h2>
      <p className="mb-5 text-sm text-gray-500">
        Variáveis aceitas nos e-mails: <code>{'{{nome}}'}</code>, <code>{'{{negocio}}'}</code>, <code>{'{{link_whatsapp}}'}</code> e <code>{'{{link_descadastro}}'}</code>.
      </p>
      <NewProspectForm allowDirectActivate={config.allowDirectActivate} liveMode={config.liveMode} />
    </div>
  )
}
