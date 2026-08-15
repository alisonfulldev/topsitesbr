import { prisma } from '@/lib/prisma'
import { LeadsClient } from './_components/LeadsClient'

export default async function LeadsPropostasPage() {
  const leads = await prisma.presentationProposalLead.findMany({
    orderBy: { capturedAt: 'desc' },
    include: {
      proposal: {
        select: { clientName: true, approvedAt: true },
      },
    },
  })

  const rows = leads.map((l) => ({
    id: l.id,
    email: l.email,
    proposalClient: l.proposal.clientName,
    capturedAt: l.capturedAt.toISOString(),
    approved: !!l.proposal.approvedAt,
  }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Leads — Propostas LP</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          E-mails captados nas propostas-apresentação.
        </p>
      </div>
      <LeadsClient rows={rows} />
    </div>
  )
}
