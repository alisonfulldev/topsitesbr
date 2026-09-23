import Link from 'next/link'
import { MarketingIcon } from './MarketingIcon'
import { marketingServices, projectContact } from '@/lib/marketing'

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#060606] px-4 py-16 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Link href="/" className="text-xl font-bold tracking-widest text-yellow-400">TOP SITE</Link>
            <p className="mt-5 max-w-sm leading-relaxed text-white/65">Criamos sites que fazem empresas serem encontradas por clientes reais. Atendimento consultivo para todo o Brasil.</p>
            <p className="mt-3 text-sm text-white/50">Atendimento remoto em todo o Brasil.</p>
          </div>
          <div>
            <h2 className="mb-4 text-sm font-semibold">Serviços</h2>
            <ul className="space-y-3">
              {marketingServices.map(({ href, label }) => <li key={href}><Link href={href} className="text-sm text-white/65 hover:text-yellow-400">{label}</Link></li>)}
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-sm font-semibold">TopSite</h2>
            <ul className="space-y-3">
              {[['/login', 'Área do cliente'], ['/termos', 'Termos de uso'], ['/privacidade', 'Privacidade']].map(([href, label]) => <li key={href}><Link href={href} className="text-sm text-white/65 hover:text-yellow-400">{label}</Link></li>)}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} TopSite · CNPJ 22.556.759/0001-98</p>
          <a href={projectContact()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-yellow-400">Falar com a TopSite <MarketingIcon name="arrow" /></a>
        </div>
      </div>
    </footer>
  )
}
