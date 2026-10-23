import Link from 'next/link'
import { MarketingIcon, WhatsAppIcon } from './MarketingIcon'
import { FaqAccordion } from './FaqAccordion'
import { ContactForm } from './ContactForm'
import { homeAnchors, offerHighlights, projectContact } from '@/lib/marketing'

// Seções da página inicial — tema claro: fundo branco, texto preto e destaques em #FDD900.
// O fundo ocupa a largura toda; o conteúdo fica centralizado em max-w-6xl.
export const HOME_CONTAINER = 'mx-auto w-full max-w-6xl'
const section = 'scroll-mt-20 border-t border-black/[0.06] bg-white px-4 py-20 text-black sm:px-8 sm:py-28'
const sectionTitle = 'mx-auto max-w-4xl text-balance text-center text-[clamp(1.375rem,0.9rem+2.6vw,2rem)] font-semibold sm:text-[clamp(2rem,1.3rem+3vw,3.5rem)] leading-[1.08] tracking-[-0.03em]'
const sectionIntro = 'mx-auto mt-6 max-w-2xl text-pretty text-center text-base leading-relaxed sm:text-lg text-black/70'

// Botão padrão das seções brancas: amarelo com texto preto
export const yellowButton = 'inline-flex h-14 items-center justify-center gap-2.5 rounded-xl bg-[#FDD900] px-8 text-base font-semibold text-black transition-colors duration-200 hover:bg-[#E8C700] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white'

const CAPTURE_PAGE_MESSAGE = 'Olá! Quero contratar a página de captura por R$ 97/mês, com a primeira parcela após 30 dias.'

export function WhySection() {
  return (
    <section id={homeAnchors.why} aria-labelledby="titulo-por-que" className={section}>
      <div className={HOME_CONTAINER}>
        <h2 id="titulo-por-que" className={sectionTitle}>Por que escolher a Top Site?</h2>
        <div className="mx-auto mt-10 max-w-3xl space-y-6 text-pretty text-center text-base leading-relaxed sm:text-lg text-black/70">
          <p>
            A Top Site começou em 2022 com o propósito de ajudar empresas a construir uma{' '}
            <strong className="font-semibold text-black">presença digital profissional</strong>. Contamos com
            desenvolvedores experientes e uma visão que vai além da aparência: criamos sites que valorizam a
            marca, apresentam os serviços com clareza e ajudam a{' '}
            <strong className="font-semibold text-black">transformar visitantes em oportunidades de negócio</strong>.
          </p>
          <p>
            Atendemos online, de qualquer lugar do mundo, com experiência em projetos nacionais e internacionais.
            Cada projeto é pensado para unir design, desempenho, boa experiência em dispositivos móveis e uma
            estrutura preparada para contribuir com o <strong className="font-semibold text-black">posicionamento orgânico no Google</strong>.
          </p>
          <p>
            Acreditamos que um site precisa ser bonito, transmitir confiança e{' '}
            <strong className="font-semibold text-black">cumprir um objetivo comercial</strong>. Por isso,
            equilibramos apresentação visual, estratégia e fundamentos técnicos de SEO em cada projeto.
          </p>
        </div>
        <div className="mt-12 text-center">
          <a href={'#' + homeAnchors.pricing} className={yellowButton + ' group h-12 px-6'}>
            Contratar agora
            <MarketingIcon name="arrow" className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  )
}

const homeServices = [
  { href: '/criacao-de-sites', label: 'Criação de sites', text: 'Site profissional one page com serviços, fotos, contatos e WhatsApp, adaptado para dispositivos móveis.' },
  { href: '/site-institucional', label: 'Site institucional', text: 'Apresente sua empresa com credibilidade, destaque seus diferenciais e facilite o contato com seus clientes.' },
  { href: '/landing-page', label: 'Landing pages', text: 'Páginas focadas em uma oferta específica, planejadas para apresentar sua proposta e incentivar o contato.' },
  { href: '/pagina-de-lancamento', label: 'Página de lançamento', text: 'Uma página para apresentar e divulgar um produto, curso, evento ou inauguração.' },
  { href: '/pagina-de-captura', label: 'Página de captura', text: 'Uma página objetiva para apresentar sua oferta e captar contatos de pessoas interessadas.' },
  { href: '/loja-virtual', label: 'Lojas virtuais', text: 'Uma experiência de compra online com catálogo de produtos, informações e recursos para vender pela internet.' },
]

export function ServicesSection() {
  return (
    <section id={homeAnchors.services} aria-labelledby="titulo-servicos" className={section}>
      <div className={HOME_CONTAINER}>
        <h2 id="titulo-servicos" className={sectionTitle + ' mb-12 sm:mb-16'}>O que a Top Site entrega?</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {homeServices.map(({ href, label, text }, index) => (
            <li key={href} className="flex">
              {/* O cartão inteiro é o link; não há links aninhados */}
              <Link href={href} className="group flex w-full flex-col items-center rounded-2xl border border-black/10 bg-white p-7 text-center transition-colors duration-200 hover:border-black/25 hover:bg-[#FAFAF7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black sm:p-8">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FDD900] text-sm font-semibold tabular-nums text-black">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="mt-6 text-lg font-semibold tracking-tight text-black sm:text-xl">{label}</h3>
                <p className="mt-3 flex-1 leading-relaxed text-black/65">{text}</p>
                <span className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-[#FDD900] px-4 text-sm font-semibold text-black transition-colors duration-200 group-hover:bg-[#E8C700]">
                  Conhecer o serviço
                  <MarketingIcon name="arrow" className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const steps = [
  {
    title: 'Você conta o que precisa',
    text: 'Entre em contato pelo WhatsApp e conte um pouco sobre sua empresa, seus serviços e o que deseja apresentar no site. Envie os materiais que já tiver, como logo, fotos, contatos e informações comerciais.',
    note: 'Sem reuniões desnecessárias e sem burocracia.',
  },
  {
    title: 'Desenvolvemos seu site',
    text: 'Com as informações recebidas, desenvolvemos uma página alinhada à identidade do seu negócio, com estrutura organizada, navegação intuitiva e adaptação para celulares e computadores.',
    note: 'Seu projeto é pensado para apresentar sua empresa com clareza e facilitar o contato com seus clientes.',
  },
  {
    title: 'Você aprova e publicamos',
    text: 'Você revisa o projeto, solicita os ajustes necessários e, após a aprovação, seguimos com a publicação do site conforme as condições e o escopo contratados.',
    note: 'Um processo claro, com acompanhamento em cada etapa.',
  },
]

export function ProcessSection() {
  return (
    <section id={homeAnchors.process} aria-labelledby="titulo-processo" className={section}>
      <div className={HOME_CONTAINER}>
        <h2 id="titulo-processo" className={sectionTitle + ' mb-12 sm:mb-16'}>Como a Top Site trabalha?</h2>
        <ol className="grid gap-12 md:grid-cols-3 md:gap-10">
          {steps.map(({ title, text, note }, index) => (
            <li key={title} className="border-t border-black/10 pt-8 text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#FDD900] text-xl font-semibold tabular-nums tracking-tight text-black">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-6 text-lg font-semibold tracking-tight sm:text-xl">{title}</h3>
              <p className="mx-auto mt-3 max-w-sm leading-relaxed text-black/70">{text}</p>
              <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-black/55">{note}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function LandingPricingSection() {
  return (
    <section id={homeAnchors.pricing} aria-labelledby="titulo-investimento" className={section}>
      <div className={HOME_CONTAINER}>
        <h2 id="titulo-investimento" className={sectionTitle}>Qual é o valor inicial para investir em um site criado pela Top Site?</h2>
        <p className={sectionIntro}>
          Uma página objetiva para apresentar sua oferta e captar contatos de pessoas interessadas,
          com design profissional e adaptação para celulares.
        </p>

        {/* Box comercial — o amarelo fica só aqui, não na seção inteira */}
        <div className="mx-auto mt-12 max-w-3xl rounded-[28px] bg-[#FDD900] px-3 py-12 text-center text-black sm:px-12 sm:py-16">
          <h3 className="mx-auto max-w-xl text-balance text-lg font-medium leading-snug sm:text-2xl">
            Comece com uma página de captura por R$ 97 por mês. A primeira parcela é paga somente 30 dias depois.
          </h3>
          <p className="mt-8 text-[clamp(3.25rem,2rem+6vw,6rem)] font-semibold leading-none tracking-[-0.04em]">
            R$ 97<span className="text-[0.4em] font-semibold tracking-tight">/mês</span>
          </p>
          <ul className="mx-auto mt-6 grid max-w-2xl grid-cols-[auto_auto] justify-center gap-1.5 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-3 sm:gap-y-4">
            {offerHighlights.map(({ icon, label }, index) => (
              <li key={label} className={'flex sm:justify-center' + (index === 0 ? ' sm:w-full' : '')}>
                <span className="inline-flex w-full items-center justify-center gap-1 whitespace-nowrap rounded-full border border-black/20 bg-white/40 px-2 py-1.5 text-[clamp(8.5px,2.5vw,12px)] max-[339px]:whitespace-normal font-semibold tracking-tight sm:w-auto sm:gap-2 sm:px-4 sm:py-2 sm:text-sm sm:tracking-normal">
                  <MarketingIcon name={icon} className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" strokeWidth={2} />
                  {label}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <a href={projectContact(CAPTURE_PAGE_MESSAGE)} target="_blank" rel="noopener noreferrer" className="inline-flex h-14 items-center justify-center gap-2.5 whitespace-nowrap rounded-xl bg-black px-5 text-[0.95rem] font-semibold text-white sm:px-8 sm:text-base transition-colors hover:bg-[#262626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FDD900]">
              <WhatsAppIcon className="h-5 w-5 shrink-0" />
              Contratar página de captura
            </a>
            <a href={'#' + homeAnchors.contact} className="inline-flex h-14 items-center justify-center rounded-xl border border-black px-8 text-base font-semibold text-black transition-colors hover:bg-black/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FDD900]">
              Quero outro site
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export const homeFaq = [
  { q: 'Quanto custa criar um site com a Top Site?', a: 'A página de captura custa R$ 97 por mês, com a primeira parcela após 30 dias e duração de 12 meses.' },
  { q: 'O que está incluído na criação do site?', a: 'O escopo depende do serviço contratado. Em geral, o projeto considera a apresentação das informações do negócio, o design da página, a adaptação para dispositivos móveis e os recursos de contato previstos na proposta.' },
  { q: 'O site funciona em celulares?', a: 'Sim. O layout é desenvolvido para se adaptar a diferentes tamanhos de tela, incluindo celulares, tablets e computadores.' },
  { q: 'A Top Site atende empresas de outras cidades ou países?', a: 'Sim. O atendimento é realizado online, permitindo conversar e desenvolver projetos para clientes de diferentes localidades, conforme as condições comerciais e operacionais do serviço.' },
  { q: 'Posso solicitar alterações antes da publicação?', a: 'Sim. Você poderá revisar o projeto e solicitar os ajustes previstos no escopo contratado antes da publicação.' },
  { q: 'O site pode aparecer no Google?', a: 'O projeto considera fundamentos técnicos de SEO, como estrutura organizada e boas práticas de apresentação do conteúdo. O posicionamento depende de vários fatores e não pode ser garantido.' },
  { q: 'Preciso fornecer todos os textos e imagens?', a: 'Você pode enviar os materiais que já possui, como logo, fotos, informações sobre os serviços e contatos. A organização do conteúdo será alinhada conforme o escopo contratado.' },
]

export function FaqSection() {
  return (
    <section id={homeAnchors.faq} aria-labelledby="titulo-faq" className={section}>
      <div className={HOME_CONTAINER}>
        <h2 id="titulo-faq" className={sectionTitle}>Perguntas frequentes</h2>

        <div className="mx-auto mt-12 max-w-3xl">
          <FaqAccordion items={homeFaq} />
        </div>
      </div>
    </section>
  )
}

export function ContactFormSection() {
  return (
    <section id={homeAnchors.contact} aria-labelledby="titulo-contato" className={section}>
      <div className={HOME_CONTAINER}>
        <h2 id="titulo-contato" className={sectionTitle}>Vamos conversar sobre o seu projeto?</h2>
        <p className={sectionIntro}>
          Conte o que você precisa e vamos entender qual solução faz mais sentido para sua empresa.
        </p>
        <div className="mx-auto mt-12 max-w-3xl">
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
