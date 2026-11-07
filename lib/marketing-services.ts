export interface ServiceContent {
  slug: string
  label: string
  title: string
  eyebrow: string
  heading: string
  description: string
  intro: string
  focus: string
  audience: string
  features: { title: string; text: string }[]
  deliverables: string[]
  faqs: { q: string; a: string }[]
  // Nome do produto nas páginas por nicho (ex: "Landing page para Dentista") — só nos serviços que têm essas páginas
  product?: string
}

// Serviços que ganham páginas por nicho (ex: /pagina-de-vendas/dentista)
export const nicheOfferServices = ['landing-page', 'pagina-de-vendas', 'pagina-de-lancamento', 'pagina-de-captura'] as const
export type NicheOfferService = (typeof nicheOfferServices)[number]

// Resposta de "Quanto custa?" das páginas de serviço — sem preço nas páginas públicas, o valor vem depois do diagnóstico
const priceFaq = (service: string) => ({
  q: 'Quanto custa ' + service + '?',
  a: 'Depende do que o seu negócio precisa e do ponto de partida. Por isso começamos com um diagnóstico grátis e sem compromisso: você vê como aparece hoje no Google e nas IAs e recebe a proposta antes de decidir qualquer coisa.',
})

export const serviceContent = {
  "criacao-de-sites": {
    "slug": "criacao-de-sites",
    "label": "Criação de sites",
    "title": "Criação de Sites para Aparecer no Google e nas IAs | TopSite",
    "eyebrow": "Criação de sites",
    "heading": "Criação de sites para aparecer no Google e nas IAs.",
    "description": "Criação de site profissional pensado para aparecer no Google e nas IAs, como ChatGPT e Gemini, quando o seu cliente pesquisar. Peça seu diagnóstico grátis pelo WhatsApp.",
    "intro": "Ainda não tem site? Criamos um do zero, com os seus serviços, fotos e contatos organizados do jeito que o Google lê e que as IAs entendem — para a sua empresa aparecer quando o cliente pesquisar.",
    "focus": "Um site feito para ser encontrado",
    "audience": "Para empresas e profissionais que ainda não têm site e querem aparecer para quem já está procurando o que eles oferecem.",
    "features": [
      {
        "title": "Conteúdo que responde ao que buscam",
        "text": "Organizamos serviços, diferenciais e região de atendimento com as palavras que o seu cliente usa na pesquisa — e que as IAs usam para montar as respostas."
      },
      {
        "title": "SEO desde o primeiro dia",
        "text": "Títulos, descrições, estrutura das páginas e velocidade configurados para o Google entender o seu site logo que ele vai ao ar."
      },
      {
        "title": "Informações claras para as IAs",
        "text": "Nome, serviços, cidade e contatos organizados em dados estruturados, para o ChatGPT, o Gemini e outras IAs conseguirem citar a sua empresa."
      },
      {
        "title": "Contato ao alcance de quem chegou",
        "text": "WhatsApp e outros canais em destaque, para que quem encontrou a sua empresa na busca fale com você em um clique."
      }
    ],
    "deliverables": [
      "Site profissional adaptado ao celular",
      "Configuração de SEO para o Google",
      "Dados estruturados para as IAs",
      "Botão de WhatsApp em destaque"
    ],
    "faqs": [
      priceFaq('criar um site'),
      {
        "q": "O que eu preciso enviar?",
        "a": "As informações da sua empresa: logo (se tiver), fotos, lista de serviços, cidade de atendimento e contatos. Você manda tudo pelo WhatsApp e a gente monta o site."
      },
      {
        "q": "O site já sai aparecendo no Google?",
        "a": "Ele já sai pronto para o Google ler e indexar. A posição depende da concorrência do seu segmento e da região, e é construída ao longo do tempo — ninguém pode garantir o primeiro lugar."
      }
    ]
  },
  "otimizacao-de-sites": {
    "slug": "otimizacao-de-sites",
    "label": "Otimização de sites",
    "title": "Otimização de Sites para o Google e para as IAs (SEO) | TopSite",
    "eyebrow": "Já tem site?",
    "heading": "Seu site já existe. Agora ele precisa aparecer.",
    "description": "Otimização de site para aparecer no Google e nas IAs, como ChatGPT e Gemini: ajuste de conteúdo, SEO técnico, velocidade e Google Meu Negócio. Peça seu diagnóstico grátis.",
    "intro": "Muito site bonito não aparece para ninguém. Analisamos o que você já tem e ajustamos conteúdo, parte técnica e Google Meu Negócio para o seu site começar a aparecer quando o cliente pesquisar — no Google e nas IAs.",
    "focus": "Aproveite o site que você já tem",
    "audience": "Para empresas que já têm site, mas não aparecem no Google, não são citadas pelas IAs ou recebem poucos contatos pela internet.",
    "features": [
      {
        "title": "Conteúdo que responde às perguntas",
        "text": "Reescrevemos e organizamos os textos para responder ao que o seu cliente pesquisa — o mesmo tipo de conteúdo que as IAs usam para indicar empresas."
      },
      {
        "title": "SEO técnico",
        "text": "Títulos, descrições, estrutura de cabeçalhos, links e indexação revisados para o Google entender do que trata cada página."
      },
      {
        "title": "Velocidade e celular",
        "text": "Um site lento ou ruim no celular perde posições e perde o cliente. Ajustamos o que pesa e o que atrapalha a navegação."
      },
      {
        "title": "Google Meu Negócio",
        "text": "Perfil da empresa completo e alinhado ao site, para você aparecer no Google Maps e nas buscas da sua região."
      }
    ],
    "deliverables": [
      "Diagnóstico do site atual",
      "Ajuste de conteúdo e SEO técnico",
      "Dados estruturados para as IAs",
      "Revisão do Google Meu Negócio"
    ],
    "faqs": [
      priceFaq('otimizar um site'),
      {
        "q": "Funciona com qualquer site?",
        "a": "Funciona com a maioria dos sites, inclusive os feitos em WordPress, Wix e outras plataformas. No diagnóstico vemos o que dá para ajustar no seu e se vale mais a pena otimizar ou refazer."
      },
      {
        "q": "Preciso passar o acesso do meu site?",
        "a": "Para aplicar os ajustes, sim. Para o diagnóstico, não: basta mandar o link do site no WhatsApp."
      },
      {
        "q": "Em quanto tempo vejo resultado?",
        "a": "Ajustes como o Google Meu Negócio costumam aparecer mais rápido. O posicionamento do site no Google e nas IAs é construído ao longo de semanas e meses, conforme a concorrência do seu segmento."
      }
    ]
  },
  "site-institucional": {
    "slug": "site-institucional",
    "label": "Site institucional",
    "title": "Site Institucional para Aparecer no Google e nas IAs | TopSite",
    "eyebrow": "Sua empresa na internet",
    "heading": "Site institucional que aparece quando procuram a sua empresa.",
    "description": "Site institucional com a apresentação da empresa, serviços e contatos, pensado para aparecer no Google e ser citado pelas IAs. Peça seu diagnóstico grátis pelo WhatsApp.",
    "intro": "Reúna a história da empresa, os serviços e os canais de atendimento em um site profissional, organizado para o Google e para as IAs entenderem quem você é, o que faz e onde atende.",
    "focus": "Credibilidade para quem pesquisa",
    "audience": "Para empresas que querem passar confiança para quem pesquisa o nome delas — e aparecer para quem ainda não conhece.",
    "features": [
      {
        "title": "Sobre a empresa",
        "text": "Trajetória, equipe e forma de trabalhar apresentadas com clareza — informações que o cliente procura e que as IAs usam para descrever o seu negócio."
      },
      {
        "title": "Serviços bem explicados",
        "text": "Seções próprias para cada serviço, com o que é, para quem é e como funciona, respondendo à pesquisa antes que o cliente precise perguntar."
      },
      {
        "title": "Portfólio e referências",
        "text": "Projetos, fotos e depoimentos autorizados que demonstram o seu trabalho e sustentam a credibilidade da empresa."
      },
      {
        "title": "Canais de atendimento",
        "text": "Telefone, WhatsApp, endereço e horário fáceis de encontrar — para quem chegou pela busca dar o próximo passo."
      }
    ],
    "deliverables": [
      "Conteúdo institucional organizado para a busca",
      "Configuração de SEO e dados para as IAs",
      "Layout alinhado à identidade da empresa",
      "Navegação e contatos adaptados ao celular"
    ],
    "faqs": [
      priceFaq('um site institucional'),
      {
        "q": "Preciso enviar textos e imagens?",
        "a": "Envie o que tiver: logo, fotos, lista de serviços e contatos. Organizamos o conteúdo com as palavras que o seu cliente usa para pesquisar."
      },
      {
        "q": "Posso ampliar o site depois?",
        "a": "Sim. Novas páginas e seções podem entrar conforme o negócio evolui — e cada página nova é mais uma chance de aparecer na busca."
      }
    ]
  },
  "landing-page": {
    "slug": "landing-page",
    "label": "Landing pages",
    "title": "Landing Page para Aparecer no Google e nas IAs | TopSite",
    "eyebrow": "Uma oferta, um objetivo",
    "heading": "Landing page para quem pesquisa exatamente o que você oferece.",
    "description": "Criação de landing page focada em uma oferta, pensada para aparecer no Google e nas IAs e levar o visitante para o WhatsApp. Peça seu diagnóstico grátis.",
    "intro": "Tem um serviço, produto ou campanha para divulgar? Criamos uma landing page que responde à busca de quem procura exatamente isso — com mensagem clara e WhatsApp em destaque.",
    "focus": "Uma página para cada busca importante",
    "audience": "Para divulgar um serviço, apresentar um lançamento ou captar interessados em uma oferta específica — pela busca orgânica ou com apoio de anúncios.",
    "features": [
      {
        "title": "Mensagem que responde à busca",
        "text": "O título e a apresentação continuam o que o visitante pesquisou — seja no Google, numa IA ou num anúncio."
      },
      {
        "title": "Oferta fácil de entender",
        "text": "Benefícios, funcionamento e dúvidas frequentes respondidos na própria página, do jeito que o Google e as IAs gostam de encontrar."
      },
      {
        "title": "Chamada para a próxima ação",
        "text": "WhatsApp, formulário ou link de inscrição posicionados para quem chegou dar o próximo passo."
      },
      {
        "title": "Medição planejada",
        "text": "Definimos quais ações acompanhar para você saber quantos contatos a página está trazendo."
      }
    ],
    "deliverables": [
      "Página focada em uma oferta",
      "Configuração de SEO para a busca da oferta",
      "Chamadas para o WhatsApp",
      "Design adaptado ao celular"
    ],
    "faqs": [
      priceFaq('uma landing page'),
      {
        "q": "A landing page substitui o site institucional?",
        "a": "Ela atende bem a uma oferta específica. Se você precisa apresentar vários serviços, equipe e histórico da empresa, um site institucional complementa essa página."
      },
      {
        "q": "A criação inclui gestão de anúncios?",
        "a": "Não: a página e a gestão da campanha são serviços diferentes. A página, porém, já fica pronta para receber o tráfego dos anúncios."
      }
    ],
    "product": "Landing page"
  },
  "loja-virtual": {
    "slug": "loja-virtual",
    "label": "Lojas virtuais",
    "title": "Loja Virtual para Aparecer no Google e nas IAs | TopSite",
    "eyebrow": "Seu catálogo na internet",
    "heading": "Loja virtual para vender para quem já procura o que você vende.",
    "description": "Criação de loja virtual e catálogo online com produtos organizados para aparecer no Google e nas IAs. Peça seu diagnóstico grátis pelo WhatsApp.",
    "intro": "Uma loja virtual começa pelo entendimento de como os seus clientes pesquisam o que você vende. Organizamos produtos, categorias e descrições para eles aparecerem na busca — e para quem chega já chegar pronto para comprar.",
    "focus": "Produtos que aparecem na busca",
    "audience": "Para negócios que querem apresentar um catálogo online ou vender com carrinho, pagamento e acompanhamento de pedidos.",
    "features": [
      {
        "title": "Catálogo organizado para a busca",
        "text": "Categorias, fotos e descrições escritas com as palavras que o cliente usa para procurar cada produto."
      },
      {
        "title": "Compra no celular",
        "text": "Navegação pensada para consultar produtos e avançar no pedido em qualquer tamanho de tela."
      },
      {
        "title": "Atendimento ou checkout",
        "text": "Avaliamos se o melhor caminho é fechar a venda pelo WhatsApp ou usar um checkout com pagamento online."
      },
      {
        "title": "Integrações da operação",
        "text": "Pagamento, entrega e estoque entram no planejamento de acordo com as ferramentas que a empresa já usa."
      }
    ],
    "deliverables": [
      "Catálogo planejado para a busca",
      "Páginas de produto com SEO",
      "Recursos e integrações definidos na proposta",
      "Design adaptado ao celular"
    ],
    "faqs": [
      priceFaq('uma loja virtual'),
      {
        "q": "Preciso de pagamento online?",
        "a": "Depende da operação. Um catálogo com atendimento pelo WhatsApp atende bem vendas consultivas; compras diretas pedem carrinho, pagamento e cálculo de entrega."
      },
      {
        "q": "Qual é o prazo de entrega?",
        "a": "O cronograma é definido depois de avaliar os produtos, os materiais e as integrações. Você recebe essa previsão na proposta, antes de começar."
      }
    ]
  },
  "pagina-de-vendas": {
    "slug": "pagina-de-vendas",
    "label": "Página de vendas",
    "title": "Página de Vendas para Aparecer no Google e nas IAs | TopSite",
    "eyebrow": "Venda o seu produto ou serviço",
    "heading": "Página de vendas que aparece para quem está pronto para comprar.",
    "description": "Criação de página de vendas com benefícios, depoimentos e pedido pelo WhatsApp, pensada para aparecer no Google e nas IAs. Peça seu diagnóstico grátis.",
    "intro": "Uma página feita para vender um produto ou serviço: aparece para quem pesquisa por ele, mostra os benefícios, responde às dúvidas e leva o cliente direto para o WhatsApp.",
    "focus": "Sua oferta para quem já está procurando",
    "audience": "Para quem quer divulgar um produto, serviço, curso ou pacote e receber os pedidos pelo WhatsApp.",
    "features": [
      {
        "title": "Título que responde à busca",
        "text": "A primeira coisa que o visitante lê confirma que ele achou o que pesquisou — e por que vale a pena."
      },
      {
        "title": "Benefícios bem explicados",
        "text": "O que o cliente ganha, como funciona e o que está incluso, em blocos fáceis de ler no celular."
      },
      {
        "title": "Depoimentos e garantias",
        "text": "Avaliações de clientes, fotos e garantias que ajudam a convencer quem ainda está em dúvida."
      },
      {
        "title": "Pedido pelo WhatsApp",
        "text": "Botões ao longo da página levam o cliente direto para a conversa com você."
      }
    ],
    "deliverables": [
      "Página de vendas completa",
      "Configuração de SEO para a busca do produto",
      "Botões de WhatsApp ao longo da página",
      "Design adaptado ao celular"
    ],
    "faqs": [
      priceFaq('uma página de vendas'),
      {
        "q": "Posso vender qualquer produto ou serviço?",
        "a": "Sim. A página serve para produtos físicos, serviços, cursos, pacotes e consultas — você conta o que vende e a gente monta."
      },
      {
        "q": "A página aceita pagamento online?",
        "a": "O caminho principal é o WhatsApp, onde você fecha a venda. Se você já usa um link de pagamento, ele pode entrar nos botões da página."
      }
    ],
    "product": "Página de vendas"
  },
  "pagina-de-lancamento": {
    "slug": "pagina-de-lancamento",
    "label": "Página de lançamento",
    "title": "Página de Lançamento para Aparecer no Google e nas IAs | TopSite",
    "eyebrow": "Lance com uma página própria",
    "heading": "Página de lançamento para a sua novidade ser encontrada.",
    "description": "Criação de página de lançamento para produto, curso, evento ou inauguração, pensada para aparecer no Google e nas IAs. Peça seu diagnóstico grátis pelo WhatsApp.",
    "intro": "Vai lançar um produto, curso ou evento, ou inaugurar um espaço? Criamos uma página própria com data, detalhes e WhatsApp em destaque — organizada para aparecer quando procurarem pela novidade.",
    "focus": "Sua novidade com endereço próprio",
    "audience": "Para quem vai lançar um produto, abrir as inscrições de um curso, divulgar um evento ou anunciar uma inauguração.",
    "features": [
      {
        "title": "Data e detalhes em destaque",
        "text": "O que está sendo lançado, quando e onde, logo no topo — as informações que o Google e as IAs mostram primeiro."
      },
      {
        "title": "Lista de espera ou inscrição",
        "text": "Quem se interessar chama no WhatsApp para garantir a vaga ou ser avisado primeiro."
      },
      {
        "title": "Fotos e vídeo",
        "text": "Imagens e vídeo de apresentação que mostram o lançamento antes mesmo de ele acontecer."
      },
      {
        "title": "Pronta para divulgar",
        "text": "Um link próprio para a bio do Instagram, os anúncios e os grupos de WhatsApp."
      }
    ],
    "deliverables": [
      "Página de lançamento completa",
      "Configuração de SEO para a busca do lançamento",
      "Botão de WhatsApp para inscrições",
      "Design adaptado ao celular"
    ],
    "faqs": [
      priceFaq('uma página de lançamento'),
      {
        "q": "Serve para evento ou inauguração?",
        "a": "Sim. Serve para produtos, cursos, eventos, inaugurações e qualquer novidade que você queira divulgar com um link próprio."
      },
      {
        "q": "Depois do lançamento a página pode virar página de vendas?",
        "a": "Pode. Depois do lançamento, a página pode ser ajustada para continuar vendendo — e continuar aparecendo na busca."
      }
    ],
    "product": "Página de lançamento"
  },
  "pagina-de-captura": {
    "slug": "pagina-de-captura",
    "label": "Página de captura",
    "title": "Página de Captura para Aparecer no Google e nas IAs | TopSite",
    "eyebrow": "Capte contatos de clientes",
    "heading": "Página de captura que transforma quem pesquisa em contato.",
    "description": "Criação de página de captura simples e direta para transformar quem pesquisa em contato pelo WhatsApp, pensada para o Google e as IAs. Peça seu diagnóstico grátis.",
    "intro": "Uma página simples e direta, feita para transformar quem chega pela busca em contato: o interessado chama no WhatsApp para receber o que você oferece.",
    "focus": "Mais contatos de quem pesquisa",
    "audience": "Para quem quer montar uma lista de interessados, oferecer um material gratuito, um cupom ou uma avaliação, e conversar com eles depois.",
    "features": [
      {
        "title": "Oferta que atrai",
        "text": "Material gratuito, cupom, avaliação ou aula: a página deixa claro o que o visitante ganha ao entrar em contato."
      },
      {
        "title": "Direta ao ponto",
        "text": "Sem distrações: só o que o visitante precisa ler para decidir chamar você."
      },
      {
        "title": "Contato pelo WhatsApp",
        "text": "O interessado chama no WhatsApp com a mensagem pronta, e a conversa já começa ali."
      },
      {
        "title": "Leve e rápida",
        "text": "Carrega rápido no celular — o que ajuda tanto na busca do Google quanto nos anúncios."
      }
    ],
    "deliverables": [
      "Página de captura completa",
      "Oferta e chamada em destaque",
      "Botão de WhatsApp com mensagem pronta",
      "Design adaptado ao celular"
    ],
    "faqs": [
      priceFaq('uma página de captura'),
      {
        "q": "Qual a diferença para uma página de vendas?",
        "a": "A página de captura busca o contato do interessado para você conversar depois. A página de vendas apresenta o produto completo para fechar a venda."
      },
      {
        "q": "Funciona com anúncios?",
        "a": "Sim. Por ser simples e leve, a página de captura funciona bem tanto na busca orgânica quanto nos anúncios do Instagram, Facebook e Google."
      }
    ],
    "product": "Página de captura"
  }
} satisfies Record<string, ServiceContent>
