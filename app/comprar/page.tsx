import type { Metadata } from 'next'
import { LandingPage } from './_components/LandingPage'

export const metadata: Metadata = {
  title: 'Site Profissional por R$97 — TOP SITE',
  description:
    'Tenha um site profissional, rápido e otimizado para o Google a partir de R$97. Design sob medida, hospedagem inclusa, no ar em até 7 dias. Primeiro mês grátis.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Site Profissional por R$97 — TOP SITE',
    description: 'Design sob medida, otimizado para Google, no ar em até 7 dias. Primeiro mês de hospedagem grátis.',
    type: 'website',
  },
}

export default function ComprarPage() {
  return <LandingPage />
}
