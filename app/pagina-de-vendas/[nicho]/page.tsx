import { notFound } from 'next/navigation'
import { getNicheBySlug } from '@/lib/seo/niches'
import { OfferNichePage, offerNicheMetadata, offerNicheParams } from '@/components/marketing/OfferNichePage'

export const dynamicParams = false

export function generateStaticParams() {
  return offerNicheParams()
}

export async function generateMetadata({ params }: { params: Promise<{ nicho: string }> }) {
  const { nicho } = await params
  return offerNicheMetadata('pagina-de-vendas', getNicheBySlug(nicho), nicho)
}

export default async function Page({ params }: { params: Promise<{ nicho: string }> }) {
  const { nicho } = await params
  const niche = getNicheBySlug(nicho)
  if (!niche) notFound()
  return <OfferNichePage service="pagina-de-vendas" niche={niche} />
}
