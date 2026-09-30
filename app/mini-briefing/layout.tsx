import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mini Briefing — TopSite',
  description: 'Responda algumas perguntas rápidas para começarmos a criar o seu site.',
  robots: { index: false, follow: false },
}

export default function MiniBriefingLayout({ children }: { children: React.ReactNode }) {
  return children
}
