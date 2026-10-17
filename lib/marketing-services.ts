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
  }
} satisfies Record<string, ServiceContent>
