import Image from 'next/image'
import Link from 'next/link'
import { MarketingIcon } from '@/components/marketing/MarketingIcon'

// Montagens de sites (public/bannersite1.png e bannersite2.png), levemente desfocadas
// para o foco ficar na caixa. O wrapper com overflow-hidden + scale evita a borda que o blur cria.
//
// Abaixo de lg: as duas montagens ficam no alto, uma de cada lado, e a caixa (mais estreita)
// sobe por cima delas — as duas imagens aparecem acima e nas laterais da caixa.
// A partir de lg: grade montagem | caixa | montagem; até xl as laterais esticam na altura
// da caixa (object-cover) e no desktop a imagem aparece inteira, apoiada na base.
// .hero-shot-fade (globals.css): abaixo de lg, a base das montagens some num degradê até o fundo branco.
const shotWrap = 'hero-shot-fade pointer-events-none absolute top-0 aspect-square w-[54vw] sm:aspect-[2062/1680] overflow-hidden lg:static lg:aspect-auto lg:w-auto lg:self-stretch xl:self-end'
const shotImg = 'h-full w-full scale-[1.03] object-cover blur-[1px] xl:h-auto'

// Hero da home — título central, caixa de mensagem apoiada na base da seção
// e as duas montagens de sites nas laterais.
// Server Component: só CSS (globals.css → .hero-*), sem JS no cliente.
export function AnimatedHero() {
  return (
    <section className="hero-bg relative overflow-hidden bg-white px-4 pt-12 sm:px-8 sm:pt-20 lg:pt-24">
      <div className="relative mx-auto max-w-5xl text-center">
        <h1 className="text-balance text-[clamp(1.5rem,0.9rem+4vw,2.2rem)] font-semibold sm:text-[clamp(1.9rem,1rem+4.4vw,4.25rem)] leading-[1.08] tracking-[-0.03em] text-black">
          Garanta seu site hoje e pague somente{' '}
          <span className="whitespace-nowrap underline decoration-[#FDD900] decoration-[0.12em] underline-offset-[0.14em] [text-decoration-skip-ink:none]">daqui a 30 dias!</span>
        </h1>
      </div>

      {/* Ocupa a largura toda da tela (anula o padding da seção) */}
      <div className="relative -mx-4 mt-8 pt-[20vw] sm:-mx-8 sm:mt-12 sm:pt-[14vw] lg:mt-14 lg:grid lg:grid-cols-[minmax(3rem,1fr)_minmax(0,46rem)_minmax(3rem,1fr)] lg:pt-0">
        <div aria-hidden="true" className={shotWrap + ' -left-[6vw] lg:left-auto'}>
          <Image src="/bannersite1.png" alt="" width={2062} height={1680} loading="eager" sizes="(min-width: 1280px) 30vw, (min-width: 1024px) 20vw, 54vw" className={shotImg + ' object-right'} />
        </div>

        {/* Caixa central — elemento principal, à frente das montagens e terminando junto com a seção */}
        <div className="hero-rise relative z-10 mx-auto w-[70vw] rounded-t-[12px] border border-b-0 border-black/10 bg-white/95 p-3.5 shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:w-[64vw] sm:rounded-t-[18px] sm:p-7 lg:mx-0 lg:w-auto">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[0.65rem] sm:gap-3 sm:text-xs">
            <span className="inline-flex items-center gap-1.5 text-black/55">
              <MarketingIcon name="pencil" className="h-3.5 w-3.5" />
              Descreva seu site
            </span>
            <Link href="/site-para" className="inline-flex items-center gap-1.5 rounded-md border border-black/10 px-2 py-1 text-black/65 transition-colors duration-150 hover:border-black/25 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 sm:px-2.5 sm:py-1.5">
              <MarketingIcon name="sparkle" className="h-3.5 w-3.5" />
              Ideias por segmento
            </Link>
          </div>

          <p className="mb-5 mt-3 text-balance text-[clamp(0.98rem,0.7rem+1.4vw,1.7rem)] font-medium leading-[1.45] tracking-[-0.01em] text-black sm:mb-10 sm:mt-7">
            <span className="sm:block">Precisa de um <span className="hero-mark hero-mark-1">site profissional</span> para sua empresa?</span>{' '}
            <span className="sm:block">Chegou a hora de <span className="hero-mark hero-mark-2">tirar esse projeto</span>{' '}
            <span className="hero-mark hero-mark-3">do papel!</span></span>
          </p>

          <p className="text-[0.65rem] text-black/50 sm:text-sm">
            Resposta rápida no WhatsApp · Atendimento em todo o Brasil
          </p>
        </div>

        <div aria-hidden="true" className={shotWrap + ' -right-[6vw] lg:right-auto'}>
          <Image src="/bannersite2.png" alt="" width={2079} height={1676} loading="eager" sizes="(min-width: 1280px) 30vw, (min-width: 1024px) 20vw, 54vw" className={shotImg + ' object-left'} />
        </div>
      </div>
    </section>
  )
}
