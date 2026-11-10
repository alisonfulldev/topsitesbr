import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { EXTRA_PRESETS, PLAN_PRESETS } from '@/lib/online-proposal/config'
import { NewProposalForm } from '../_components/NewProposalForm'

export default async function NewOnlineProposalPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Nova proposta online</h2>
      <NewProposalForm plans={PLAN_PRESETS.map((p) => ({ ...p }))} extras={EXTRA_PRESETS.map((e) => ({ ...e }))} />
    </div>
  )
}
