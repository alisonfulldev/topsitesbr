import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

const BASE = 'https://topsitebr.com.br'
const title = 'Criação de Loja Virtual para seu Negócio | TOP SITE'
const description = 'Planeje sua loja virtual com a TOP SITE. Catálogo, experiência no celular e recursos de venda conforme seu projeto. Solicite um orçamento pelo WhatsApp.'
const contact = 'https://wa.me/5518996742364?text=' + encodeURIComponent('Olá! Quero um orçamento para criar minha loja virtual.')

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title,
  description,
  alternates: { canonical: BASE + '/loja-virtual' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website', title, description, url: BASE + '/loja-virtual',
    siteName: 'TOP SITE', locale: 'pt_BR',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TOP SITE — Sites profissionais para o seu negócio' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/og-image.png'] },
}

const features = [
  { title: 'Catálogo fácil de explorar', text: 'Organize produtos por categoria, com fotos, descrições e informações que ajudem o cliente a escolher. A quantidade de produtos e variações entra no planejamento.' },
  { title: 'Experiência no celular', text: 'Páginas pensadas para navegar, consultar produtos e iniciar uma compra em diferentes tamanhos de tela, com botões claros e conteúdo legível.' },
  { title: 'Uma forma de vender que faz sentido', text: 'Defina se o cliente vai concluir o pedido pelo WhatsApp ou por um checkout. Pagamento, frete e integrações são avaliados conforme a operação.' },
  { title: 'Estrutura para busca', text: 'Títulos descritivos, páginas de produtos organizadas e links entre categorias ajudam visitantes e buscadores a entender o catálogo.' },
]
const questions = [
  { q: 'A loja virtual custa R$197?', a: 'O valor de R$197 anunciado no site se refere à oferta de site profissional. Uma loja virtual precisa de orçamento conforme catálogo, checkout e integrações. Converse com a equipe para definir o escopo e o investimento.' },
  { q: 'Qual é o prazo de entrega?', a: 'O prazo anunciado para os sites é de 7 dias úteis. Para a loja virtual, confirmamos no orçamento como o catálogo e as integrações se encaixam nesse prazo.' },
  { q: 'Preciso de carrinho e pagamento online?', a: 'Depende da sua operação. Um catálogo com atendimento pelo WhatsApp pode ser suficiente para vendas consultivas. Para compras diretas, vale avaliar carrinho, pagamento e entrega no planejamento.' },
  { q: 'O que devo separar para começar?', a: 'Tenha em mãos sua marca, fotos, nomes e descrições dos produtos, preços, variações e informações de entrega. Informe também como você acompanha o estoque e recebe os pedidos hoje.' },
]
const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service', name: 'Criação de Loja Virtual',
      url: BASE + '/loja-virtual', description,
      provider: { '@type': 'Organization', '@id': BASE + '/#organization', name: 'TOP SITE', url: BASE },
      areaServed: { '@type': 'Country', name: 'Brazil' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Loja Virtual', item: BASE + '/loja-virtual' },
      ],
    },
  ],
}

export default function LojaVirtualPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <MarketingHeader />
      <main>
        <section className="px-4 pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="mx-auto max-w-6xl">
            <nav aria-label="Caminho da página" className="mb-12 text-sm text-white/60">
              <Link href="/" className="hover:text-yellow-400">Início</Link>
              <span aria-hidden="true" className="mx-3">/</span>
              <span aria-current="page">Loja Virtual</span>
            </nav>
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-yellow-400">Vendas pela internet</p>
                <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
                  Criação de loja virtual <span className="text-yellow-400">para o seu negócio</span>
                </h1>
                <p className="mb-8 max-w-xl text-lg leading-relaxed text-white/70">
                  Apresente seus produtos e facilite o próximo passo da compra.
                  Planejamos a loja a partir do seu catálogo, da sua rotina e da forma como você atende seus clientes.
                </p>
                <a href={contact} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-xl bg-yellow-400 px-7 py-4 font-semibold text-black transition-colors hover:bg-yellow-300">
                  Pedir orçamento de loja virtual
                </a>
                <p className="mt-4 text-sm text-white/60">Projeto sob orçamento · Atendimento em todo o Brasil</p>
              </div>
              <aside className="rounded-3xl border border-yellow-400/20 bg-yellow-400/5 p-8 sm:p-10">
                <h2 className="mb-6 text-2xl font-semibold">Como seus clientes vão comprar?</h2>
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-6">
                    <h3 className="mb-2 font-semibold text-yellow-400">Catálogo + WhatsApp</h3>
                    <p className="leading-relaxed text-white/70">O cliente conhece os produtos e conversa com você para tirar dúvidas e fechar o pedido.</p>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-yellow-400">Loja com checkout</h3>
                    <p className="leading-relaxed text-white/70">O cliente escolhe os itens e segue para a compra. Avaliamos os recursos de pagamento e entrega necessários.</p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
        <section className="bg-[#101010] px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">O que planejar na sua loja virtual</h2>
            <p className="mb-10 max-w-2xl leading-relaxed text-white/70">Cada operação tem necessidades diferentes. Estes são os pontos que orientam a proposta do seu projeto.</p>
            <div className="grid gap-6 md:grid-cols-2">
              {features.map((feature) => (
                <article key={feature.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
                  <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                  <p className="leading-relaxed text-white/70">{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-10 text-3xl font-bold sm:text-4xl">Do planejamento à publicação</h2>
            <ol className="grid gap-8 md:grid-cols-3">
              {[
                ['Entendemos sua operação', 'Você apresenta seus produtos, público e como recebe pedidos. Definimos recursos, investimento e prazo na proposta.'],
                ['Organizamos a experiência', 'Estruturamos as páginas e o caminho da compra conforme o escopo aprovado. Você acompanha e revisa a apresentação.'],
                ['Conferimos antes de publicar', 'Validamos navegação, informações dos produtos e os recursos contratados para colocar a loja no ar.'],
              ].map(([heading, text], index) => (
                <li key={heading}>
                  <span className="mb-4 block text-3xl font-bold text-yellow-400">0{index + 1}</span>
                  <h3 className="mb-3 text-xl font-semibold">{heading}</h3>
                  <p className="leading-relaxed text-white/70">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="bg-[#101010] px-4 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-3xl font-bold">Dúvidas sobre criação de loja virtual</h2>
            <div className="space-y-4">
              {questions.map(({ q, a }) => (
                <details key={q} className="rounded-2xl border border-white/10 p-6">
                  <summary className="cursor-pointer font-semibold">{q}</summary>
                  <p className="mt-4 leading-relaxed text-white/70">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section className="px-4 py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-5 text-3xl font-bold sm:text-4xl">Vamos planejar sua loja?</h2>
            <p className="mb-8 text-lg text-white/70">Conte o que você vende e como deseja receber seus pedidos.</p>
            <a href={contact} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-xl bg-yellow-400 px-7 py-4 font-semibold text-black hover:bg-yellow-300">Conversar sobre meu projeto</a>
            <p className="mt-10 leading-relaxed text-white/60">
              Seu objetivo é apresentar serviços? Conheça o <Link href="/site-institucional" className="text-yellow-400 underline">site institucional</Link>.
              Para divulgar uma oferta específica, veja a <Link href="/landing-page" className="text-yellow-400 underline">landing page</Link>.
              Confira também nosso <Link href="/portfolio" className="text-yellow-400 underline">portfólio</Link>.
            </p>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
