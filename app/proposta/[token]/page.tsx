import { hashToken } from '@/lib/proposal-token'
import { prisma } from '@/lib/prisma'
import { COMPANY_WHATSAPP } from '@/lib/config'
import { ProposalPageView } from './_components/ProposalPageView'

export default async function ProposalTokenPage({
  params,
}: {
  params: { token: string }
}) {
  const tokenHash = hashToken(params.token)

  const accessToken = await prisma.proposalAccessToken.findUnique({
    where: { tokenHash },
    include: {
      proposal: {
        include: {
          client: { select: { id: true, name: true, email: true } },
        },
      },
    },
  })

  const isValid = accessToken && accessToken.expiresAt >= new Date()

  if (!isValid) {
    const waUrl = `https://wa.me/${COMPANY_WHATSAPP}`
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🔗</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Link expirado ou inválido
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Este link de proposta não é mais válido. Entre em contato conosco para
            receber um novo link.
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors text-sm"
          >
            Fale conosco pelo WhatsApp
          </a>
        </div>
      </div>
    )
  }

  const proposal = accessToken.proposal

  return (
    <ProposalPageView
      token={params.token}
      proposal={{
        id: proposal.id,
        title: proposal.title,
        description: proposal.description,
        includedItems: proposal.includedItems,
        creationPrice: Number(proposal.creationPrice),
        status: proposal.status,
        paymentUrl: proposal.paymentUrl,
        client: {
          name: proposal.client.name,
          email: proposal.client.email,
        },
      }}
    />
  )
}
