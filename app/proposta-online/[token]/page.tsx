import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { findByToken, parseExtras, parseKeys, proposalLink, recordEvent, setupTotal, syncSetupPayment } from '@/lib/online-proposal/service'
import { buildOnlineContract } from '@/lib/online-proposal/contract'
import { getOnlineProposalConfig } from '@/lib/online-proposal/config'
import { ProposalFlow } from './_components/ProposalFlow'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sua proposta — TopSite',
  robots: { index: false, follow: false, nocache: true },
}

export default async function OnlineProposalPage({ params }: { params: { token: string } }) {
  // Retorno do checkout ou webhook atrasado: confere o pagamento do setup no Asaas
  await syncSetupPayment(params.token)

  const p = await findByToken(params.token)
  if (!p) notFound()

  // Primeira abertura do link fica no histórico
  const opened = await prisma.onlineProposalEvent.findFirst({ where: { proposalId: p.id, type: 'aberta' }, select: { id: true } })
  if (!opened && p.status === 'previa_enviada') await recordEvent(p.id, 'aberta', 'O prospect abriu o link da proposta.')

  const config = await getOnlineProposalConfig()
  const extras = parseExtras(p.extras)
  const selected = parseKeys(p.selectedExtras)

  return (
    <ProposalFlow
      token={p.token}
      status={p.status}
      name={p.name}
      company={p.company}
      planName={p.planName}
      setupPrice={Number(p.setupPrice)}
      monthlyPrice={Number(p.monthlyPrice)}
      setupTotal={setupTotal(p)}
      extras={extras}
      selectedExtras={selected}
      previewSrc={p.previewHtml ? `/proposta-online/${p.token}/previa` : p.previewUrl}
      revisionsLeft={Math.max(0, p.maxRevisions - p.revisionsUsed)}
      expiresAt={p.expiresAt.toISOString()}
      whatsappUrl={`https://wa.me/${config.whatsappNumber}`}
      contractHtml={
        p.status === 'aprovada'
          ? buildOnlineContract({
              name: p.name,
              company: p.company,
              document: p.document,
              email: p.email,
              whatsapp: p.whatsapp,
              planKey: p.planKey,
              planName: p.planName,
              setupPrice: Number(p.setupPrice),
              monthlyPrice: Number(p.monthlyPrice),
              extras: extras.filter((e) => selected.includes(e.key)),
              previewLink: proposalLink(p.token),
            })
          : null
      }
      paymentMethod={p.setupPaymentMethod as 'PIX' | 'CREDIT_CARD' | null}
      paymentUrl={p.setupPaymentUrl}
      isMockPayment={process.env.NODE_ENV !== 'production' && process.env.PAYMENT_DRIVER !== 'asaas'}
    />
  )
}
