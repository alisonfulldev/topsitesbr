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
    "title": "Criação de Sites Profissionais para Empresas | TopSite",
    "eyebrow": "Presença digital",
    "heading": "Sites profissionais que apresentam o valor da sua empresa.",
    "description": "Criação de sites profissionais com design personalizado, navegação responsiva e SEO. Apresente sua empresa e facilite o contato. Conheça a TopSite.",
    "intro": "Seu site deve explicar o que você faz, transmitir confiança e facilitar o contato. Desenvolvemos a estrutura e a apresentação a partir do seu negócio e dos objetivos do projeto.",
    "focus": "Um site pensado para quem vai usar",
    "audience": "Para empresas e profissionais que precisam apresentar serviços, organizar informações e transformar visitas em conversas.",
    "features": [
      {
        "title": "Conteúdo com direção",
        "text": "Organizamos serviços, diferenciais e informações de contato para que o visitante entenda a sua oferta e saiba como avançar."
      },
      {
        "title": "Design personalizado",
        "text": "Cores, tipografia e composição alinhadas à sua identidade, com navegação adaptada a celulares, tablets e computadores."
      },
      {
        "title": "Estrutura para o Google",
        "text": "Títulos, descrições, URLs e links internos planejados para ajudar os buscadores a entender o conteúdo de cada página."
      },
      {
        "title": "Contato ao alcance",
        "text": "WhatsApp, formulários e outros canais definidos conforme o atendimento da sua empresa e o escopo contratado."
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
        "a": "O investimento depende da quantidade de páginas, conteúdo e funcionalidades. Após entender sua necessidade, apresentamos uma proposta com escopo, prazo e condições."
      },
      {
        "q": "Qual é a diferença entre site e landing page?",
        "a": "Um site organiza diferentes informações sobre a empresa. Uma landing page concentra uma oferta e uma ação principal, como pedir um orçamento ou entrar em contato."
      },
      {
        "q": "O site vai aparecer em primeiro no Google?",
        "a": "Preparamos a estrutura para rastreamento e compreensão do conteúdo. Posicionamento depende também da concorrência, relevância e outros fatores; não há garantia de uma posição específica."
      }
    ]
  },
  "site-institucional": {
    "slug": "site-institucional",
    "label": "Site institucional",
    "title": "Site Institucional para Empresas | TopSite",
    "eyebrow": "Sua empresa na internet",
    "heading": "Um site institucional à altura da sua empresa.",
    "description": "Desenvolvimento de sites institucionais para apresentar sua empresa, equipe e serviços. Design personalizado, conteúdo organizado e contato fácil com a TopSite.",
    "intro": "Reúna a história da empresa, os serviços e os canais de atendimento em um endereço próprio. Criamos uma apresentação que ajuda clientes e parceiros a conhecer seu trabalho.",
    "focus": "Credibilidade em cada página",
    "audience": "Para empresas que precisam de uma apresentação completa, com espaço para explicar sua atuação e seus diferenciais.",
    "features": [
      {
        "title": "Sobre a empresa",
        "text": "Apresente sua trajetória, equipe e forma de trabalhar com informações que ajudem o visitante a entender quem está por trás do negócio."
      },
      {
        "title": "Serviços bem explicados",
        "text": "Páginas e seções próprias para descrever o que a empresa oferece, para quem e como funciona o atendimento."
      },
      {
        "title": "Portfólio e referências",
        "text": "Organize projetos, fotos e depoimentos autorizados que demonstrem o seu trabalho e sustentem sua apresentação."
      },
      {
        "title": "Canais de atendimento",
        "text": "Facilite a localização de telefone, WhatsApp, formulário, endereço e horário, conforme a necessidade da empresa."
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
        "a": "Novas páginas e funcionalidades podem ser avaliadas conforme a evolução do negócio. O escopo e o investimento dessa ampliação são combinados antes do desenvolvimento."
      }
    ]
  },
  "landing-page": {
    "slug": "landing-page",
    "label": "Landing pages",
    "title": "Criação de Landing Pages para Campanhas | TopSite",
    "eyebrow": "Uma oferta, um objetivo",
    "heading": "Landing pages para transformar interesse em contato.",
    "description": "Criação de landing pages para campanhas, serviços e lançamentos. Conteúdo focado na oferta, design responsivo e chamadas para contato. Conheça a TopSite.",
    "intro": "Quando uma campanha tem um objetivo específico, a página precisa acompanhar essa intenção. Desenvolvemos landing pages com uma oferta clara e um caminho direto para a próxima ação.",
    "focus": "A página acompanha sua campanha",
    "audience": "Para divulgar um serviço, apresentar um lançamento ou captar interessados em uma oferta específica.",
    "features": [
      {
        "title": "Mensagem alinhada ao anúncio",
        "text": "Organizamos o título e a apresentação para dar continuidade ao que trouxe o visitante até a página."
      },
      {
        "title": "Oferta fácil de entender",
        "text": "Benefícios, funcionamento e dúvidas frequentes ajudam o visitante a avaliar se a solução atende à sua necessidade."
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
    "title": "Criação de Lojas Virtuais para Empresas | TopSite",
    "eyebrow": "Seu catálogo na internet",
    "heading": "Lojas virtuais conectadas à sua forma de vender.",
    "description": "Criação de lojas virtuais e catálogos online. Planeje produtos, pedidos, pagamentos e integrações conforme sua operação. Solicite uma proposta à TopSite.",
    "intro": "Uma loja virtual começa pelo entendimento da sua operação. Planejamos a apresentação dos produtos e o caminho da compra de acordo com seu catálogo, atendimento e processo de venda.",
    "focus": "Do produto ao pedido",
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
  },
  "desenvolvimento-de-software": {
    "slug": "desenvolvimento-de-software",
    "label": "Software sob medida",
    "title": "Desenvolvimento de Software Sob Medida | TopSite",
    "eyebrow": "Tecnologia para sua operação",
    "heading": "Software sob medida para a forma como sua empresa trabalha.",
    "description": "Desenvolvimento de software sob medida, sistemas web, painéis e integrações para empresas. Organize processos com uma solução personalizada da TopSite.",
    "intro": "Quando planilhas e ferramentas isoladas deixam o trabalho mais difícil, um sistema próprio pode ajudar. Entendemos seu processo para desenvolver uma solução com funções e fluxos que façam sentido para a equipe.",
    "focus": "O processo da empresa orienta o sistema",
    "audience": "Para empresas que precisam organizar informações, acompanhar atividades ou conectar etapas que hoje dependem de trabalho manual.",
    "features": [
      {
        "title": "Sistemas de gestão",
        "text": "Planejamos cadastros, pedidos, atendimentos e outros fluxos conforme a rotina do negócio. As funções são definidas a partir do problema que você precisa resolver."
      },
      {
        "title": "Painéis e relatórios",
        "text": "Reúna informações importantes para acompanhar atividades e tomar decisões, com indicadores definidos junto à equipe que usará o sistema."
      },
      {
        "title": "Automações e integrações",
        "text": "Avaliamos conexões entre ferramentas e tarefas repetitivas que podem ser automatizadas, considerando as APIs e os acessos disponíveis."
      },
      {
        "title": "Áreas de acesso",
        "text": "Organize experiências para equipe, clientes ou parceiros, com perfis e permissões planejados conforme as responsabilidades de cada usuário."
      }
    ],
    "deliverables": [
      "Mapeamento dos processos e das prioridades",
      "Escopo funcional e etapas de desenvolvimento",
      "Validação dos fluxos com quem vai utilizar",
      "Condições de implantação, suporte e evolução na proposta"
    ],
    "faqs": [
      {
        "q": "Como começa um projeto de software sob medida?",
        "a": "Começamos entendendo quem vai usar, qual problema precisa ser resolvido e como o processo funciona hoje. Com essas informações, definimos prioridades e preparamos a proposta."
      },
      {
        "q": "Quanto custa e quanto tempo leva?",
        "a": "Investimento e cronograma dependem das funcionalidades, integrações, dados e etapas de validação. São definidos após o levantamento do escopo, sem uma promessa única para todos os sistemas."
      },
      {
        "q": "É possível começar com uma versão menor?",
        "a": "Sim. Podemos planejar uma primeira versão com as funções prioritárias e avaliar novas etapas a partir do uso. O que entra em cada versão fica definido na proposta."
      },
      {
        "q": "Vocês integram com sistemas que já utilizo?",
        "a": "Avaliamos essa possibilidade conforme a documentação, permissões e recursos de integração de cada ferramenta. Compatibilidade e dependências são verificadas durante o planejamento."
      },
      {
        "q": "Como funcionam suporte e novas funcionalidades?",
        "a": "As condições de suporte, manutenção e hospedagem são combinadas na proposta. Novas funcionalidades são avaliadas com escopo, prazo e investimento próprios."
      }
    ]
  }
} satisfies Record<string, ServiceContent>
