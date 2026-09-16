import Image from 'next/image'
import Link from 'next/link'

const WA_NUMBER = '5518996742364'
const MSG_DOUBT = 'Olá! Tenho uma dúvida sobre os sites da TopSite. Pode me ajudar?'
function wa() { return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(MSG_DOUBT)}` }

export function MarketingFooter() {
  return (
    <footer className="relative py-16" style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2">
            <Link href="/">
              <Image src="/logo.png" alt="TOP SITE" width={120} height={35} className="h-8 w-auto mb-4" />
            </Link>
            <p className="text-sm text-white/40 max-w-xs leading-relaxed">
              Sites profissionais para pequenos negócios e autônomos. Atendemos todo o Brasil remotamente.
            </p>
          </div>

          {/* Serviços */}
          <div>
            <p className="text-xs font-semibold text-white/25 uppercase tracking-wider mb-4">Serviços</p>
            <ul className="space-y-2.5">
              {[
                ['/criacao-de-sites', 'Criação de Sites'],
                ['/site-institucional', 'Site Institucional'],
                ['/landing-page', 'Landing Page'],
                ['/loja-virtual', 'Loja Virtual'],
                ['/portfolio', 'Portfólio'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/40 hover:text-white/70 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold text-white/25 uppercase tracking-wider mb-4">Links</p>
            <ul className="space-y-2.5">
              {[
                ['/login', 'Área do cliente'],
                ['/termos', 'Termos de Uso'],
                ['/privacidade', 'Política de Privacidade'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/40 hover:text-white/70 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.04] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/25 text-center sm:text-left">
            © {new Date().getFullYear()} TOP SITE · CNPJ 22.556.759/0001-98 · Atendemos todo o Brasil
          </p>
          <a
            href={wa()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/40 hover:text-white/65 transition-colors"
          >
            💬 Falar no WhatsApp
          </a>
        </div>
      </div>
    </footer>
  )
}
