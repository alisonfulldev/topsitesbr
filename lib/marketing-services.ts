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
  // Produto vendido a preço fixo (R$ 165) — ausente nos serviços sob orçamento
  offerProduct?: string
}

// Serviços por R$ 165 que ganham páginas por nicho (ex: /pagina-de-vendas/dentista)
export const nicheOfferServices = ['landing-page', 'pagina-de-vendas', 'pagina-de-lancamento', 'pagina-de-captura'] as const
export type NicheOfferService = (typeof nicheOfferServices)[number]

export const serviceContent = {
  "criacao-de-sites": {
    "slug": "criacao-de-sites",
    "label": "Criação de sites",
    "title": "Criação de Sites por R$ 165 | Site Barato e Profissional | TopSite",
    "eyebrow": "Criação de sites",
    "heading": "Criação de sites por apenas R$ 165.",
    "description": "Criação de site profissional por apenas R$ 165: site institucional one page com serviços, fotos, contatos e botão de WhatsApp, adaptado ao celular. Peça o seu pelo WhatsApp.",
    "intro": "Sua empresa na internet sem pagar caro. Criamos um site institucional one page com seus serviços, fotos, contatos e botão de WhatsApp, adaptado ao celular — tudo resolvido pelo WhatsApp.",
    "focus": "Tudo isso por R$ 165",
    "audience": "Para empresas e profissionais que querem um site bonito e profissional sem gastar muito.",
    "features": [
      {
        "title": "Conteúdo que responde ao que buscam",
        "text": "Organizamos serviços, diferenciais e informações de contato de forma que seus futuros clientes encontrem o que procuram — e entendam por que você é a resposta."
      },
      {
        "title": "Design que transmite credibilidade",
        "text": "Cores, tipografia e composição alinhadas à sua identidade, com navegação adaptada a celulares, tablets e computadores."
      },
      {
        "title": "Preço que cabe no bolso",
        "text": "Site profissional por apenas R$ 165, sem orçamento complicado. Você já sabe quanto vai pagar antes de chamar."
      },
      {
        "title": "Contato ao alcance de quem chegou",
        "text": "WhatsApp, formulários e outros canais posicionados para que o visitante que encontrou sua empresa não precise procurar como entrar em contato."
      }
    ],
    "deliverables": [
      "Site institucional one page",
      "Design adaptado ao celular e ao computador",
      "Botão de WhatsApp em destaque",
      "Revisão e ajustes antes de ficar pronto"
    ],
    "faqs": [
      {
        "q": "Quanto custa criar um site?",
        "a": "O site institucional one page sai por apenas R$ 165. Ele reúne em uma página a apresentação da sua empresa, seus serviços, fotos, contatos e botão de WhatsApp, adaptado ao celular. Hospedagem e manutenção são opcionais, por R$ 29/mês."
      },
      {
        "q": "O que eu preciso enviar?",
        "a": "As informações da sua empresa: logo (se tiver), fotos, lista de serviços e contatos. Você manda tudo pelo WhatsApp e a gente monta o site."
      },
      {
        "q": "Tem mensalidade?",
        "a": "Não é obrigatória. Hospedagem e manutenção são opcionais, por R$ 29/mês, para quem quer que a gente deixe o site no ar e cuide dos ajustes."
      }
    ],
    "offerProduct": "Site institucional one page"
  },
  "site-institucional": {
    "slug": "site-institucional",
    "label": "Site institucional",
    "title": "Site Institucional por R$ 165 | Site Barato para Empresas | TopSite",
    "eyebrow": "Sua empresa na internet",
    "heading": "Site institucional por apenas R$ 165.",
    "description": "Site institucional one page por apenas R$ 165: apresentação da empresa, serviços, fotos, contatos e botão de WhatsApp, adaptado ao celular. Peça o seu pelo WhatsApp.",
    "intro": "Reúna a história da empresa, os serviços e os canais de atendimento em uma página profissional, adaptada ao celular e com botão de WhatsApp em destaque — por apenas R$ 165.",
    "focus": "Credibilidade por R$ 165",
    "audience": "Para empresas que querem passar confiança na internet com uma apresentação profissional, sem pagar caro.",
    "features": [
      {
        "title": "Sobre a empresa",
        "text": "Apresente sua trajetória, equipe e forma de trabalhar com informações que ajudem o visitante a entender quem está por trás do negócio e por que confiar."
      },
      {
        "title": "Serviços bem explicados",
        "text": "Páginas e seções próprias para descrever o que a empresa oferece, para quem e como funciona o atendimento — respondendo antes que o cliente precise perguntar."
      },
      {
        "title": "Portfólio e referências",
        "text": "Organize projetos, fotos e depoimentos autorizados que demonstrem o seu trabalho e sustentem a credibilidade da empresa."
      },
      {
        "title": "Canais de atendimento",
        "text": "Facilite a localização de telefone, WhatsApp, formulário, endereço e horário — para que quem chegou ao site consiga dar o próximo passo."
      }
    ],
    "deliverables": [
      "Arquitetura de conteúdo institucional",
      "Páginas e seções acordadas na proposta",
      "Layout alinhado à identidade da empresa",
      "Navegação e contatos adaptados ao celular"
    ],
    "faqs": [
      {
        "q": "Quanto custa o site institucional?",
        "a": "O site institucional one page sai por apenas R$ 165. Ele reúne em uma página a apresentação da sua empresa, seus serviços, fotos, contatos e botão de WhatsApp, adaptado ao celular. Hospedagem e manutenção são opcionais, por R$ 29/mês."
      },
      {
        "q": "Preciso enviar textos e imagens?",
        "a": "Sim: logo (se tiver), fotos, lista de serviços e contatos. Você manda tudo pelo WhatsApp e a gente monta o site."
      },
      {
        "q": "Posso ampliar o site depois?",
        "a": "Novas páginas e seções podem ser avaliadas conforme a evolução do negócio. O escopo e o investimento dessa ampliação são combinados antes do desenvolvimento."
      }
    ],
    "offerProduct": "Site institucional one page"
  },
  "landing-page": {
    "slug": "landing-page",
    "label": "Landing pages",
    "title": "Landing Page por R$ 165 | Criação de Landing Page Barata | TopSite",
    "eyebrow": "Uma oferta, um objetivo",
    "heading": "Landing page por apenas R$ 165.",
    "description": "Criação de landing page por apenas R$ 165: página focada na sua oferta, adaptada ao celular e com botão de WhatsApp em destaque. Peça a sua pelo WhatsApp.",
    "intro": "Tem um serviço, produto ou campanha para divulgar? Criamos uma landing page com mensagem clara e botão de WhatsApp em destaque, adaptada ao celular — por apenas R$ 165.",
    "focus": "Sua oferta em uma página, por R$ 165",
    "audience": "Para divulgar um serviço, apresentar um lançamento ou captar interessados em uma oferta específica — de forma orgânica ou com apoio de anúncios.",
    "features": [
      {
        "title": "Mensagem que responde à busca",
        "text": "Organizamos o título e a apresentação para dar continuidade ao que trouxe o visitante até a página — seja uma busca no Google ou um anúncio."
      },
      {
        "title": "Oferta fácil de entender",
        "text": "Benefícios, funcionamento e dúvidas frequentes ajudam o visitante a avaliar se a solução atende à sua necessidade sem precisar entrar em contato para entender."
      },
      {
        "title": "Chamada para a próxima ação",
        "text": "Formulários, WhatsApp ou links de inscrição podem compor o caminho de contato, conforme o objetivo da campanha."
      },
      {
        "title": "Medição planejada",
        "text": "Definimos quais ações precisam ser acompanhadas e avaliamos as ferramentas de medição que farão parte do projeto."
      }
    ],
    "deliverables": [
      "Estrutura focada na oferta da campanha",
      "Layout responsivo e chamadas para ação",
      "Formulário ou canal de contato conforme escopo",
      "Revisão do caminho de conversão antes da publicação"
    ],
    "faqs": [
      {
        "q": "Quanto custa uma landing page?",
        "a": "A landing page sai por apenas R$ 165: uma página focada na sua oferta, adaptada ao celular e com botão de WhatsApp em destaque. Hospedagem e manutenção são opcionais, por R$ 29/mês."
      },
      {
        "q": "A landing page substitui o site institucional?",
        "a": "Ela atende bem a uma oferta específica. Se você precisa apresentar diferentes serviços, equipe e histórico da empresa, um site institucional pode complementar essa página."
      },
      {
        "q": "A criação inclui gestão de anúncios?",
        "a": "A página e a gestão da campanha são atividades distintas. A proposta de desenvolvimento informa o que será entregue e quais configurações de medição estão incluídas."
      },
      {
        "q": "É possível integrar com meu CRM?",
        "a": "A integração depende da ferramenta e dos acessos disponíveis. Informe qual CRM você usa para avaliarmos a viabilidade, o escopo e o prazo."
      }
    ],
    "offerProduct": "Landing page"
  },
  "loja-virtual": {
    "slug": "loja-virtual",
    "label": "Lojas virtuais",
    "title": "Criação de Lojas Virtuais | TopSite",
    "eyebrow": "Seu catálogo na internet",
    "heading": "Lojas virtuais para quem quer vender para quem já busca o que você oferece.",
    "description": "Criamos lojas virtuais e catálogos online para empresas que querem vender pela internet. Planejamento do catálogo, jornada de compra e integrações. Solicite uma proposta à TopSite.",
    "intro": "Uma loja virtual começa pelo entendimento da sua operação e de como seus clientes pesquisam o que você vende. Planejamos a apresentação dos produtos e o caminho da compra para que quem chega já chegue pronto para comprar.",
    "focus": "Do produto ao pedido — para quem já estava procurando",
    "audience": "Para negócios que querem apresentar um catálogo online ou estruturar vendas com carrinho, pagamento e acompanhamento de pedidos.",
    "features": [
      {
        "title": "Catálogo organizado",
        "text": "Categorias, fotos, descrições e variações ajudam o cliente a encontrar e comparar os produtos. Definimos a estrutura conforme o catálogo."
      },
      {
        "title": "Compra no celular",
        "text": "Navegação e ações pensadas para consultar produtos e avançar no pedido em diferentes tamanhos de tela."
      },
      {
        "title": "Atendimento ou checkout",
        "text": "Avaliamos se o melhor caminho é concluir a venda pelo WhatsApp ou usar um checkout com os recursos necessários."
      },
      {
        "title": "Integrações da operação",
        "text": "Pagamento, entrega e estoque entram no planejamento de acordo com as ferramentas usadas pela empresa e sua viabilidade de integração."
      }
    ],
    "deliverables": [
      "Planejamento do catálogo e da jornada de compra",
      "Páginas responsivas de acordo com o escopo",
      "Recursos e integrações definidos na proposta",
      "Validação dos fluxos contratados antes da publicação"
    ],
    "faqs": [
      {
        "q": "Quanto custa uma loja virtual?",
        "a": "A loja virtual tem orçamento sob medida, porque depende da quantidade de produtos, da forma de pagamento e das integrações. Conte no WhatsApp o que você vende e passamos o valor. Se você precisa só apresentar a empresa e os produtos, o site institucional one page sai por apenas R$ 165."
      },
      {
        "q": "Preciso de pagamento online?",
        "a": "Depende da operação. Um catálogo com atendimento pelo WhatsApp pode atender vendas consultivas. Compras diretas podem exigir carrinho, pagamento e cálculo de entrega."
      },
      {
        "q": "Qual é o prazo de entrega?",
        "a": "O cronograma é definido após avaliar os produtos, materiais e integrações. Você recebe essa previsão na proposta antes de iniciar o projeto."
      }
    ]
  },
  "pagina-de-vendas": {
    "slug": "pagina-de-vendas",
    "label": "Página de vendas",
    "title": "Página de Vendas por R$ 165 | Criação de Página de Vendas Barata | TopSite",
    "eyebrow": "Venda o seu produto ou serviço",
    "heading": "Página de vendas por apenas R$ 165.",
    "description": "Criação de página de vendas por apenas R$ 165: apresente seu produto ou serviço com benefícios, depoimentos e botão de WhatsApp, adaptada ao celular. Peça a sua pelo WhatsApp.",
    "intro": "Uma página feita para vender um produto ou serviço específico: mostra os benefícios, responde às dúvidas e leva o cliente direto para o WhatsApp — tudo adaptado ao celular, por apenas R$ 165.",
    "focus": "Sua oferta pronta para vender, por R$ 165",
    "audience": "Para quem quer divulgar um produto, serviço, curso ou pacote e receber os pedidos pelo WhatsApp.",
    "features": [
      {
        "title": "Título que chama atenção",
        "text": "A primeira coisa que o visitante lê já mostra o que você vende e por que vale a pena."
      },
      {
        "title": "Benefícios bem explicados",
        "text": "O que o cliente ganha, como funciona e o que está incluso, em blocos fáceis de ler no celular."
      },
      {
        "title": "Depoimentos e garantias",
        "text": "Espaço para avaliações de clientes, fotos e garantias que ajudam a convencer quem ainda está em dúvida."
      },
      {
        "title": "Pedido pelo WhatsApp",
        "text": "Botões de compra ao longo da página levam o cliente direto para a conversa com você."
      }
    ],
    "deliverables": [
      "Página de vendas completa",
      "Seções de benefícios, depoimentos e dúvidas",
      "Botões de WhatsApp ao longo da página",
      "Design adaptado ao celular"
    ],
    "faqs": [
      {
        "q": "Quanto custa uma página de vendas?",
        "a": "A página de vendas sai por apenas R$ 165: uma página completa para apresentar o seu produto ou serviço, adaptada ao celular e com botões de WhatsApp. Hospedagem e manutenção são opcionais, por R$ 29/mês."
      },
      {
        "q": "Posso vender qualquer produto ou serviço?",
        "a": "Sim. A página serve para produtos físicos, serviços, cursos, pacotes e consultas — você conta o que vende e a gente monta."
      },
      {
        "q": "A página aceita pagamento online?",
        "a": "O caminho principal é o WhatsApp, onde você fecha a venda. Se você já usa um link de pagamento, ele pode entrar nos botões da página."
      }
    ],
    "offerProduct": "Página de vendas"
  },
  "pagina-de-lancamento": {
    "slug": "pagina-de-lancamento",
    "label": "Página de lançamento",
    "title": "Página de Lançamento por R$ 165 | Página para Lançar Produto ou Evento | TopSite",
    "eyebrow": "Lance com uma página própria",
    "heading": "Página de lançamento por apenas R$ 165.",
    "description": "Criação de página de lançamento por apenas R$ 165: divulgue um produto, curso, evento ou inauguração com uma página própria, adaptada ao celular e com WhatsApp. Peça pelo WhatsApp.",
    "intro": "Vai lançar um produto, curso, evento ou inaugurar um espaço? Criamos uma página própria para o lançamento, com data, detalhes e botão de WhatsApp em destaque — por apenas R$ 165.",
    "focus": "Seu lançamento com página própria, por R$ 165",
    "audience": "Para quem vai lançar um produto, abrir as inscrições de um curso, divulgar um evento ou anunciar uma inauguração.",
    "features": [
      {
        "title": "Data e detalhes em destaque",
        "text": "O que está sendo lançado, quando e onde, logo no topo da página."
      },
      {
        "title": "Lista de espera ou inscrição",
        "text": "Quem se interessar entra em contato pelo WhatsApp para garantir a vaga ou ser avisado primeiro."
      },
      {
        "title": "Fotos e vídeo",
        "text": "Espaço para imagens e vídeo de apresentação que mostram o lançamento antes mesmo de ele acontecer."
      },
      {
        "title": "Pronta para divulgar",
        "text": "Um link próprio para colocar na bio do Instagram, nos anúncios e nos grupos de WhatsApp."
      }
    ],
    "deliverables": [
      "Página de lançamento completa",
      "Data, detalhes e fotos em destaque",
      "Botão de WhatsApp para inscrições",
      "Design adaptado ao celular"
    ],
    "faqs": [
      {
        "q": "Quanto custa uma página de lançamento?",
        "a": "A página de lançamento sai por apenas R$ 165: uma página própria para o seu lançamento, adaptada ao celular e com botão de WhatsApp em destaque. Hospedagem e manutenção são opcionais, por R$ 29/mês."
      },
      {
        "q": "Serve para evento ou inauguração?",
        "a": "Sim. A página de lançamento serve para produtos, cursos, eventos, inaugurações e qualquer novidade que você queira divulgar com um link próprio."
      },
      {
        "q": "Depois do lançamento a página pode virar página de vendas?",
        "a": "Pode. Depois do lançamento, a página pode ser ajustada para continuar vendendo — combine os ajustes pelo WhatsApp."
      }
    ],
    "offerProduct": "Página de lançamento"
  },
  "pagina-de-captura": {
    "slug": "pagina-de-captura",
    "label": "Página de captura",
    "title": "Página de Captura por R$ 165 | Página para Captar Contatos | TopSite",
    "eyebrow": "Capte contatos de clientes",
    "heading": "Página de captura por apenas R$ 165.",
    "description": "Criação de página de captura por apenas R$ 165: uma página simples e direta para captar contatos de interessados, adaptada ao celular e com WhatsApp. Peça a sua pelo WhatsApp.",
    "intro": "Uma página simples e direta, feita para transformar visitantes em contatos: o interessado chama no WhatsApp para receber o que você oferece — por apenas R$ 165.",
    "focus": "Mais contatos de interessados, por R$ 165",
    "audience": "Para quem quer montar uma lista de interessados, oferecer um material gratuito, um cupom ou uma avaliação, e falar com eles depois.",
    "features": [
      {
        "title": "Oferta que atrai",
        "text": "Um material gratuito, cupom, avaliação ou aula: a página deixa claro o que o visitante ganha ao entrar em contato."
      },
      {
        "title": "Direta ao ponto",
        "text": "Sem distrações: só o que o visitante precisa ler para decidir chamar você."
      },
      {
        "title": "Contato pelo WhatsApp",
        "text": "O interessado chama você no WhatsApp com a mensagem pronta, e a conversa já começa ali."
      },
      {
        "title": "Ideal para anúncios",
        "text": "Um link próprio e leve para usar nos anúncios do Instagram, Facebook e Google."
      }
    ],
    "deliverables": [
      "Página de captura completa",
      "Oferta e chamada em destaque",
      "Botão de WhatsApp com mensagem pronta",
      "Design adaptado ao celular"
    ],
    "faqs": [
      {
        "q": "Quanto custa uma página de captura?",
        "a": "A página de captura sai por apenas R$ 165: uma página simples e direta para captar contatos, adaptada ao celular e com botão de WhatsApp. Hospedagem e manutenção são opcionais, por R$ 29/mês."
      },
      {
        "q": "Qual a diferença para uma página de vendas?",
        "a": "A página de captura busca o contato do interessado para você conversar depois. A página de vendas apresenta o produto completo para fechar a venda."
      },
      {
        "q": "Funciona com anúncios?",
        "a": "Sim. Por ser simples e leve, a página de captura é uma ótima opção para usar nos anúncios do Instagram, Facebook e Google."
      }
    ],
    "offerProduct": "Página de captura"
  }
} satisfies Record<string, ServiceContent>
