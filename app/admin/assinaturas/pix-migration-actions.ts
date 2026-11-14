'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { setPixMigrationEnabled } from '@/lib/monthly-plan-service'

/** Liga/desliga a migração automática das assinaturas antigas para o Pix Automático (cron diário). */
export async function setPixMigrationAction(enabled: boolean): Promise<{ error?: string }> {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'admin') return { error: 'Não autorizado.' }
  await setPixMigrationEnabled(enabled)
  revalidatePath('/admin/assinaturas')
  return {}
}
