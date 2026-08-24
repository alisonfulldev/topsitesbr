import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import QuoteResult from '../_components/QuoteResult'
import type { ProjectType } from '../actions'

export default async function QuoteSharePage({ params }: { params: { token: string } }) {
  const lead = await prisma.quoteLead.findUnique({ where: { token: params.token } })
  if (!lead) notFound()

  return (
    <div className="min-h-screen antialiased" style={{ background: '#0a0a0a', color: '#ffffff' }}>

      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-72 blur-[100px]"
          style={{ background: 'radial-gradient(ellipse, rgba(250,204,21,0.06) 0%, transparent 65%)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <header
        className="relative z-20 sticky top-0 backdrop-blur-md"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#000000' }}
      >
        <nav className="max-w-[560px] mx-auto px-5 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" aria-label="TOP SITE">
            <Image src="/logo.png" alt="TOP SITE" width={100} height={34} className="h-7 w-auto" priority />
          </Link>
          <Link
            href="/login"
            className="text-[12px] px-3 py-1.5 rounded-lg transition-all duration-200"
            style={{ color: '#ccc', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            Acessar painel
          </Link>
        </nav>
      </header>

      <main className="relative z-10 max-w-[480px] mx-auto px-5 sm:px-6 py-4 sm:py-20">
        <div className="text-center mb-4 sm:mb-12">
          <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase mb-5" style={{ color: 'rgba(52,211,153,0.9)' }}>
            <span className="w-8 h-px" style={{ background: 'rgba(52,211,153,0.4)' }} />
            Orçamento gerado
            <span className="w-8 h-px" style={{ background: 'rgba(52,211,153,0.4)' }} />
          </div>
          <h1 className="text-[24px] sm:text-[40px] font-bold text-white leading-[1.15] tracking-tight">
            Aqui está<br />
            <span style={{ color: '#facc15' }}>seu orçamento.</span>
          </h1>
        </div>

        <QuoteResult
          initial={{
            projectType: lead.projectType as ProjectType,
            pageCount: lead.pageCount ?? 1,
            hasAdmin: lead.hasAdmin,
            hasLogo: lead.hasLogo,
            hasDomain: lead.hasDomain,
            hasHosting: lead.hasHosting,
          }}
          name={lead.name}
          segment={lead.segment}
        />
      </main>
    </div>
  )
}
