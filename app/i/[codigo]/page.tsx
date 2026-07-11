import { prisma } from '@/lib/prisma'
import { RedirectScreen } from './_components/RedirectScreen'

export default async function ReferralRedirectPage({
  params,
}: {
  params: { codigo: string }
}) {
  const { codigo } = params

  const client = await prisma.client.findFirst({
    where: { referralCode: codigo },
    select: { id: true },
  })

  await prisma.referralClick.create({
    data: { referralCode: codigo },
  })

  const number = process.env.WHATSAPP_BUSINESS_NUMBER ?? ''
  const base = 'Olá! Quero saber mais sobre o site de R$97 😊'
  const message = client ? `${base} (ref: ${codigo})` : base
  const waUrl = `https://wa.me/${number}?text=${encodeURIComponent(message)}`

  return <RedirectScreen waUrl={waUrl} />
}
