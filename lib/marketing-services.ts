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
}

export const serviceContent = {
  "criacao-de-sites": {
    "slug": "criacao-de-sites",
    "label": "Criação de sites",
    "title": "Criação de Sites | TopSite",
    "eyebrow": "Presença que trabalha por você",
    "heading": "Sites que fazem sua empresa ser encontrada por quem já procura o que você vende.",
    "description": "Criamos sites profissionais para empresas serem encontradas por clientes reais. Design responsivo, estrutura pensada para buscadores e foco em resultado. Conheça a TopSite.",
    "intro": "Seu site deve ser mais do que uma presença — deve ser o caminho pelo qual seus futuros clientes chegam até você. Construímos a estrutura e o conteúdo para que isso aconteça.",
    "focus": "Um site que trabalha enquanto você trabalha",
    "audience": "Para empresas e profissionais que querem ser encontrados por quem já procura o que oferecem, e transformar essas visitas em conversas reais.",
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
        "title": "Estrutura para ser encontrado",
        "text": "Organizamos títulos, endereços e conteúdo de cada página para que os buscadores entendam exatamente o que sua empresa oferece e apresentem você para quem procura."
      },
      {
        "title": "Contato ao alcance de quem chegou",
        "text": "WhatsApp, formulários e outros canais posicionados para que o visitante que encontrou sua empresa não precise procurar como entrar em contato."
      }
    ],
    "deliverables": [
      "Estrutura de páginas definida no planejamento",
      "Design e desenvolvimento responsivo",
      "Configuração dos canais de contato acordados",
      "Revisão antes da publicação"
    ],
    "faqs": [
      {
        "q": "Quanto custa criar um site?",
        "a": "O investimento depende da quantidade de páginas, conteúdo e do que precisa ser feito para que sua empresa seja encontrada no seu segmento. Após entender sua necessidade, apresentamos uma proposta com escopo, prazo e condições."
      },
      {
        "q": "Em quanto tempo o site começa a trazer resultado?",
        "a": "Depende do mercado e da concorrência, mas o caminho começa no lançamento. Construímos a estrutura correta desde o início para que a evolução aconteça de forma consistente."
      },
      {
        "q": "Preciso continuar anunciando se tiver um site assim?",
        "a": "Não substituímos os anúncios — adicionamos uma fonte de clientes que funciona em paralelo. Quem chega por busca já quer o que você oferece; é um lead mais qualificado do que o que viu um anúncio."
      }
    ]
  },
  "site-institucional": {
    "slug": "site-institucional",
    "label": "Site institucional",
    "title": "Site Institucional para Empresas | TopSite",
    "eyebrow": "Sua empresa na internet",
    "heading": "Uma apresentação institucional que coloca sua empresa no caminho de quem a busca.",
    "description": "Desenvolvimento de sites institucionais que apresentam sua empresa e a fazem ser encontrada por clientes reais. Design personalizado e estrutura pensada para resultado. Solicite uma proposta à TopSite.",
    "intro": "Reúna a história da empresa, os serviços e os canais de atendimento em um endereço próprio. Criamos uma apresentação que ajuda clientes e parceiros a conhecer seu trabalho — e que faz você aparecer quando pesquisam pelo que sua empresa oferece.",
    "focus": "Credibilidade que aparece quando precisam de você",
    "audience": "Para empresas que precisam de uma apresentação completa, com espaço para explicar sua atuação, seus diferenciais e ser encontradas por quem procura o que oferecem.",
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
        "q": "Quantas páginas o site institucional pode ter?",
        "a": "Definimos essa quantidade no planejamento. Sobre, serviços, portfólio e contato são exemplos comuns; a estrutura deve refletir o conteúdo que sua empresa precisa apresentar."
      },
      {
        "q": "Preciso enviar textos e imagens?",
        "a": "Conversamos sobre os materiais disponíveis antes de começar. A proposta define as responsabilidades pela produção, revisão e fornecimento dos conteúdos."
      },
      {
        "q": "Posso ampliar o site depois?",
        "a": "Novas páginas e seções podem ser avaliadas conforme a evolução do negócio. O escopo e o investimento dessa ampliação são combinados antes do desenvolvimento."
      }
    ]
  },
  "landing-page": {
    "slug": "landing-page",
    "label": "Landing pages",
    "title": "Criação de Landing Pages | TopSite",
    "eyebrow": "Uma oferta, um objetivo",
    "heading": "Landing pages que convertem quem já está procurando o que você oferece.",
    "description": "Criamos landing pages para empresas que querem converter visitantes em contatos e clientes. Foco na oferta, design responsivo e estrutura pensada para resultado. Solicite uma proposta à TopSite.",
    "intro": "Quando você tem uma oferta específica para apresentar, a página precisa acompanhar essa intenção — e aparecer para quem já procura por ela. Desenvolvemos landing pages com uma mensagem clara e um caminho direto para a próxima ação.",
    "focus": "A página certa para quem chegou procurando",
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
    ]
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
        "a": "O investimento depende do catálogo, das variações, do checkout e das integrações. A proposta detalha o desenvolvimento e os custos recorrentes identificados no planejamento."
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
