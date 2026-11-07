import Link from 'next/link'
import { MarketingIcon, WhatsAppIcon } from './MarketingIcon'
import { FaqAccordion } from './FaqAccordion'
import { ContactForm } from './ContactForm'
import { ctaLabels, ctaNote, homeAnchors, offerHighlights, offerPriceAnswer, projectContact } from '@/lib/marketing'

// Seções da página inicial — tema claro: fundo branco, texto preto e destaques em #FDD900.
// O fundo ocupa a largura toda; o conteúdo fica centralizado em max-w-6xl.
export const HOME_CONTAINER = 'mx-auto w-full max-w-6xl'
const section = 'scroll-mt-20 border-t border-black/[0.06] bg-white px-4 py-20 text-black sm:px-8 sm:py-28'
const sectionTitle = 'mx-auto max-w-4xl text-balance text-center text-[clamp(1.375rem,0.9rem+2.6vw,2rem)] font-semibold sm:text-[clamp(2rem,1.3rem+3vw,3.5rem)] leading-[1.08] tracking-[-0.03em]'
const sectionIntro = 'mx-auto mt-6 max-w-2xl text-pretty text-center text-base leading-relaxed sm:text-lg text-black/70'

// Botão padrão das seções brancas: amarelo com texto preto
export const yellowButton = 'inline-flex h-14 items-center justify-center gap-2.5 rounded-xl bg-[#FDD900] px-8 text-base font-semibold text-black transition-colors duration-200 hover:bg-[#E8C700] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white'

export function WhySection() {
  return (
    <section id={homeAnchors.why} aria-labelledby="titulo-por-que" className={section}>
      <div className={HOME_CONTAINER}>
        <h2 id="titulo-por-que" className={sectionTitle}>Seu cliente pesquisa. Quem aparece fica com ele.</h2>
        <div className="mx-auto mt-10 max-w-3xl space-y-6 text-pretty text-center text-base leading-relaxed sm:text-lg text-black/70">
          <p>
            Antes de ligar ou chamar no WhatsApp, o cliente pesquisa: no Google, no Google Maps e, cada vez mais,{' '}
            <strong className="font-semibold text-black">perguntando para IAs como o ChatGPT e o Gemini</strong>. Se a sua
            empresa não aparece nessas respostas, quem aparece é o concorrente.
          </p>
          <p>
            A Top Site existe desde 2022 e faz sites pensados para serem encontrados. Se você ainda não tem site,{' '}
            <strong className="font-semibold text-black">criamos um do zero</strong>. Se já tem, mas ele não aparece,{' '}
            <strong className="font-semibold text-black">otimizamos o que você já tem</strong>.
          </p>
          <p>
            Organizamos o conteúdo para responder ao que o seu cliente pergunta, cuidamos da parte técnica que o Google lê
            e deixamos as informações da empresa claras para que as IAs consigam{' '}
            <strong className="font-semibold text-black">citar o seu negócio como resposta</strong>.
          </p>
        </div>
        <div className="mt-12 text-center">
          <a href={'#' + homeAnchors.pricing} className={yellowButton + ' group h-12 px-6'}>
            {ctaLabels.anchor}
            <MarketingIcon name="arrow" className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  )
}

const homeServices = [
  { href: '/criacao-de-sites', label: 'Criação de sites', text: 'Ainda não tem site? Criamos um do zero, já estruturado para aparecer no Google e nas IAs.' },
  { href: '/otimizacao-de-sites', label: 'Otimização de sites', text: 'Já tem site, mas ninguém encontra? Ajustamos conteúdo e parte técnica para ele começar a aparecer.' },
  { href: '/site-institucional', label: 'Site institucional', text: 'Sua empresa, seus serviços e seus diferenciais explicados do jeito que o cliente pesquisa.' },
  { href: '/landing-page', label: 'Landing pages', text: 'Uma página para cada serviço ou oferta, respondendo à busca exata de quem procura por ela.' },
  { href: '/pagina-de-captura', label: 'Página de captura', text: 'Uma página objetiva para quem chegou pela busca deixar o contato ou chamar no WhatsApp.' },
  { href: '/loja-virtual', label: 'Lojas virtuais', text: 'Produtos organizados para aparecer quando alguém procura exatamente o que você vende.' },
]

export function ServicesSection() {
  return (
    <section id={homeAnchors.services} aria-labelledby="titulo-servicos" className={section}>
      <div className={HOME_CONTAINER}>
        <h2 id="titulo-servicos" className={sectionTitle + ' mb-12 sm:mb-16'}>Criar ou otimizar: o que a Top Site faz</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {homeServices.map(({ href, label, text }, index) => (
            <li key={href} className="flex">
              {/* O cartão inteiro é o link; não há links aninhados */}
              <Link href={href} className="group flex w-full flex-col items-center rounded-2xl border border-black/10 bg-white p-7 text-center transition-colors duration-200 hover:border-black/25 hover:bg-[#FAFAF7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black sm:p-8">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FDD900] text-sm font-semibold tabular-nums text-black">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="mt-6 text-lg font-semibold tracking-tight text-black sm:text-xl">{label}</h3>
                <p className="mt-3 flex-1 leading-relaxed text-black/65">{text}</p>
                <span className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-[#FDD900] px-4 text-sm font-semibold text-black transition-colors duration-200 group-hover:bg-[#E8C700]">
                  {ctaLabels.learnMore}
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
    title: 'Diagnóstico grátis',
    text: 'Chame no WhatsApp, conte sobre o seu negócio e mande o link do seu site, se tiver. Vemos como você aparece hoje no Google e nas IAs e quem aparece no seu lugar.',
    note: 'Grátis, sem compromisso e sem reunião.',
  },
  {
    title: 'Criamos ou otimizamos',
    text: 'Montamos o seu site do zero ou ajustamos o que você já tem: conteúdo que responde ao que o cliente pesquisa, parte técnica de SEO, Google Meu Negócio e informações claras para as IAs.',
    note: 'Tudo adaptado ao celular, com o WhatsApp sempre à mão.',
  },
  {
    title: 'Você aprova e publicamos',
    text: 'Você revisa, pede os ajustes que precisar e, depois da aprovação, o site vai ao ar pronto para ser encontrado.',
    note: 'Um processo claro, com acompanhamento em cada etapa.',
  },
]

export function ProcessSection() {
  return (
    <section id={homeAnchors.process} aria-labelledby="titulo-processo" className={section}>
      <div className={HOME_CONTAINER}>
        <h2 id="titulo-processo" className={sectionTitle + ' mb-12 sm:mb-16'}>Como funciona</h2>
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

export function DiagnosticHomeSection() {
  return (
    <section id={homeAnchors.pricing} aria-labelledby="titulo-diagnostico" className={section}>
      <div className={HOME_CONTAINER}>
        <h2 id="titulo-diagnostico" className={sectionTitle}>Comece pelo diagnóstico grátis</h2>
        <p className={sectionIntro}>
          Antes de qualquer proposta, você descobre como o seu negócio aparece hoje quando o seu cliente pesquisa.
        </p>

        {/* Box comercial — o amarelo fica só aqui, não na seção inteira */}
        <div className="mx-auto mt-12 max-w-3xl rounded-[28px] bg-[#FDD900] px-3 py-12 text-center text-black sm:px-12 sm:py-16">
          <h3 className="mx-auto max-w-xl text-balance text-lg font-medium leading-snug sm:text-2xl">
            Vemos onde você aparece no Google e nas IAs, quem aparece no seu lugar e o que fazer primeiro.
          </h3>
          <p className="mt-8 text-[clamp(3.25rem,2rem+6vw,6rem)] font-semibold leading-none tracking-[-0.04em]">
            Grátis
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
            <a href={projectContact()} target="_blank" rel="noopener noreferrer" className="inline-flex h-14 items-center justify-center gap-2.5 whitespace-nowrap rounded-xl bg-black px-5 text-[0.95rem] font-semibold text-white sm:px-8 sm:text-base transition-colors hover:bg-[#262626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FDD900]">
              <WhatsAppIcon className="h-5 w-5 shrink-0" />
              {ctaLabels.whatsapp}
            </a>
            <a href={'#' + homeAnchors.contact} className="inline-flex h-14 items-center justify-center rounded-xl border border-black px-8 text-base font-semibold text-black transition-colors hover:bg-black/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FDD900]">
              Prefiro o formulário
            </a>
          </div>
          <p className="mt-5 text-sm text-black/70">{ctaNote}</p>
        </div>
      </div>
    </section>
  )
}

export const homeFaq = [
  { q: 'Quanto custa?', a: offerPriceAnswer },
  { q: 'O que é aparecer nas IAs?', a: 'Cada vez mais gente pede indicações ao ChatGPT, ao Gemini e a outras IAs em vez de rolar a lista do Google. Essas ferramentas montam a resposta com o que encontram na internet. Um site com informações claras sobre a empresa, os serviços e a região aumenta a chance de o seu negócio ser citado.' },
  { q: 'Já tenho site. Preciso fazer um novo?', a: 'Nem sempre. No diagnóstico vemos o que dá para aproveitar: muitas vezes otimizar o conteúdo e a parte técnica do site atual já resolve. Quando não compensa, explicamos o porquê.' },
  { q: 'Vocês garantem o primeiro lugar no Google?', a: 'Não, e desconfie de quem garante. A posição depende da concorrência, da região e do próprio Google. O que fazemos é deixar o seu site do jeito que o Google e as IAs precisam para entender e indicar o seu negócio.' },
  { q: 'Em quanto tempo começo a aparecer?', a: 'Depende do ponto de partida e da concorrência do seu segmento. Ajustes como o Google Meu Negócio costumam dar resultado mais rápido; o posicionamento do site no Google é construído ao longo de semanas e meses.' },
  { q: 'O diagnóstico é grátis mesmo?', a: 'Sim. Você chama no WhatsApp, conta sobre o seu negócio e recebe o diagnóstico sem compromisso. Só depois, se fizer sentido, apresentamos a proposta.' },
  { q: 'A Top Site atende empresas de outras cidades?', a: 'Sim. O atendimento é online, pelo WhatsApp, para empresas de todo o Brasil.' },
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
        <h2 id="titulo-contato" className={sectionTitle}>Peça seu diagnóstico grátis</h2>
        <p className={sectionIntro}>
          Prefere não chamar no WhatsApp agora? Conte sobre o seu negócio e entramos em contato.
        </p>
        <div className="mx-auto mt-12 max-w-3xl">
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
