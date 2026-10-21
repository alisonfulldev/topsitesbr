import Image from 'next/image'
import Link from 'next/link'
import { MarketingIcon, WhatsAppIcon } from './MarketingIcon'
import { NewsletterForm } from './NewsletterForm'
import { CONTACT_EMAIL, homeAnchors, marketingServices, projectContact } from '@/lib/marketing'

// Âncoras com "/" na frente: funcionam a partir de qualquer página do site
const homeNav = [
  [homeAnchors.why, 'Por que escolher a Top Site?'],
  [homeAnchors.services, 'O que a Top Site entrega?'],
  [homeAnchors.process, 'Como a Top Site trabalha?'],
  [homeAnchors.pricing, 'Preços'],
  [homeAnchors.faq, 'Perguntas frequentes'],
  [homeAnchors.contact, 'Contato'],
]

// Footer: fundo preto (#000), textos brancos e títulos/destaques em amarelo (#FDD900).
// Composição centralizada: marca no topo, grade de links na largura toda, newsletter e rodapé final.
const columnTitle = 'mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#FDD900]'
const footerLink = 'rounded text-sm text-white underline-offset-4 transition-colors duration-150 hover:text-[#FDD900] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDD900]/60'

export function MarketingFooter() {
  return (
    <footer className="bg-black px-4 pb-10 pt-20 text-center text-white sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col items-center">
          <Link href="/" aria-label="TopSite — início" className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDD900]/60">
            <Image src="/logo.png" alt="TopSite" width={48} height={48} className="h-11 w-11 object-contain" />
          </Link>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-sm leading-relaxed text-white">
            A Top Site desenvolve sites profissionais para empresas que desejam fortalecer sua presença digital,
            apresentar seus serviços e criar novas oportunidades de negócio.
          </p>
        </div>

        <div className="mt-14 grid w-full gap-12 border-t border-white/15 pt-12 sm:grid-cols-3 sm:gap-8">
          <div>
            <h2 className={columnTitle}>Serviços</h2>
            <ul className="space-y-3">
              {marketingServices.map(({ href, label }) => <li key={href}><Link href={href} className={footerLink}>{label}</Link></li>)}
            </ul>
          </div>

          <div>
            <h2 className={columnTitle}>Navegação</h2>
            <ul className="space-y-3">
              {homeNav.map(([anchor, label]) => <li key={anchor}><Link href={'/#' + anchor} className={footerLink}>{label}</Link></li>)}
            </ul>
          </div>

          <div>
            <h2 className={columnTitle}>Contato</h2>
            <ul className="space-y-4">
              <li>
                <a href={'mailto:' + CONTACT_EMAIL} className={footerLink + ' inline-flex items-center justify-center gap-2.5 break-all'}>
                  <MarketingIcon name="mail" className="h-4 w-4 shrink-0" />
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a href={projectContact()} target="_blank" rel="noopener noreferrer" className={footerLink + ' inline-flex items-center justify-center gap-2.5'}>
                  <WhatsAppIcon className="h-4 w-4 shrink-0" />
                  WhatsApp (18) 99674-2364
                </a>
              </li>
              <li><Link href="/login" className={footerLink}>Área do cliente</Link></li>
            </ul>
          </div>
        </div>

        {/* Newsletter — caixa centralizada com borda amarela */}
        <div className="mx-auto mt-16 w-full max-w-2xl rounded-2xl border border-[#FDD900] px-5 py-8 sm:px-10 sm:py-10">
          <h2 className="text-lg font-semibold tracking-tight text-[#FDD900]">Tecnologia que move empresas.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white">
            Receba novidades sobre tecnologia, presença digital, sites e soluções que ajudam empresas a evoluir.
          </p>
          <div className="mt-6">
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/15 pt-5 text-xs sm:mt-12 sm:pt-8 text-white sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} TopSite</p>
          <ul className="flex flex-wrap justify-end gap-x-6 gap-y-2">
            {[['/privacidade', 'Política de privacidade'], ['/termos', 'Termos de uso'], ['/mapa-do-site', 'Mapa do site']].map(([href, label]) => (
              <li key={href}><Link href={href} className="rounded underline-offset-4 transition-colors hover:text-[#FDD900] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDD900]/60">{label}</Link></li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
