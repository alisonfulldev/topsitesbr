import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

function monthsAgo(months: number): Date {
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  return d
}

function daysFromNow(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

const DEMO_EMAILS = [
  'maria@teste.com',
  'joao@teste.com',
  'ana@teste.com',
  'carlos@teste.com',
  'fernanda@teste.com',
  'pedro@teste.com',
  'lucia@teste.com',
  'roberto@teste.com',
  'sandra@teste.com',
  'marcos@teste.com',
]

const DEMO_REFERRAL_CODES = [
  'MARIA2K4X', 'JOAO8P5Q', 'ANAP9R3K', 'CARLOSS7', 'FERN8Y2Z',
  'PEDROV4T', 'LUCIAV5M', 'ROBN3X2A', 'SANDF6W8', 'MARCR1K9',
]

async function cleanDemo() {
  await prisma.referralClick.deleteMany({
    where: { referralCode: { in: DEMO_REFERRAL_CODES } },
  })
  await prisma.cost.deleteMany({ where: { description: { startsWith: '[DEMO]' } } })
  await prisma.promotion.deleteMany({ where: { title: { startsWith: '[DEMO]' } } })

  for (const email of DEMO_EMAILS) {
    const client = await prisma.client.findUnique({ where: { email } })
    if (!client) continue

    await prisma.notification.deleteMany({ where: { clientId: client.id } })
    await prisma.ticket.deleteMany({ where: { clientId: client.id } })
    await prisma.order.deleteMany({ where: { clientId: client.id } })
    await prisma.planChangeHistory.deleteMany({ where: { clientId: client.id } })
    await prisma.referral.deleteMany({ where: { referredClientId: client.id } })
    await prisma.referral.deleteMany({ where: { referrerClientId: client.id } })

    const subs = await prisma.subscription.findMany({ where: { clientId: client.id } })
    for (const sub of subs) {
      await prisma.invoice.deleteMany({ where: { subscriptionId: sub.id } })
    }
    await prisma.subscription.deleteMany({ where: { clientId: client.id } })

    const sites = await prisma.site.findMany({ where: { clientId: client.id } })
    for (const site of sites) {
      await prisma.domain.deleteMany({ where: { siteId: site.id } })
    }
    await prisma.site.deleteMany({ where: { clientId: client.id } })

    await prisma.user.deleteMany({ where: { clientId: client.id } })
    await prisma.client.delete({ where: { id: client.id } })
  }

  // Also clean orphan admin notifications from previous demo runs
  await prisma.notification.deleteMany({
    where: {
      clientId: null,
      message: { contains: 'DEMO' },
    },
  })
}

async function main() {
  console.log('🌱 Iniciando seed de demonstração...\n')

  // ── Fetch plans & products ──────────────────────────────────────────────────
  const planBasico = await prisma.plan.findUniqueOrThrow({ where: { name: 'Básico' } })
  const planPlus = await prisma.plan.findUniqueOrThrow({ where: { name: 'Plus' } })

  const prodLogo = await prisma.product.findFirstOrThrow({ where: { name: 'Logo Profissional' } })
  const prodDominio = await prisma.product.findFirstOrThrow({ where: { name: 'Domínio Personalizado' } })
  const prodSEO = await prisma.product.findFirstOrThrow({ where: { name: 'SEO (Otimização para Buscadores)' } })
  const prodAlteracaoImagem = await prisma.product.findFirstOrThrow({ where: { name: 'Alteração de Imagem (avulsa)' } })
  const prodNovaPagina = await prisma.product.findFirstOrThrow({ where: { name: 'Nova Página' } })
  const prodNovaSec = await prisma.product.findFirstOrThrow({ where: { name: 'Nova Seção' } })
  const prodUpgradeLanding = await prisma.product.findFirstOrThrow({ where: { name: 'Upgrade para Landing Page' } })

  // ── Limpar dados demo anteriores ───────────────────────────────────────────
  await cleanDemo()
  console.log('🧹 Dados demo anteriores limpos\n')

  const clientPwd = await bcrypt.hash('cliente123', 12)

  async function mkClient(opts: {
    name: string
    email: string
    phone: string
    referralCode: string
    monthlyFeeAcknowledgedAt?: Date
    downloadRetentionShownAt?: Date
  }) {
    const client = await prisma.client.create({
      data: {
        name: opts.name,
        email: opts.email,
        phone: opts.phone,
        referralCode: opts.referralCode,
        monthlyFeeAcknowledgedAt: opts.monthlyFeeAcknowledgedAt,
        downloadRetentionShownAt: opts.downloadRetentionShownAt,
      },
    })
    await prisma.user.create({
      data: {
        clientId: client.id,
        name: opts.name,
        email: opts.email,
        passwordHash: clientPwd,
        role: 'client',
        active: true,
      },
    })
    return client
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 1. MARIA SANTOS — pendente_ativacao, SEM assinatura (testa tela de ativação)
  // ──────────────────────────────────────────────────────────────────────────
  const maria = await mkClient({
    name: 'Maria Santos',
    email: 'maria@teste.com',
    phone: '11911110001',
    referralCode: 'MARIA2K4X',
    // monthlyFeeAcknowledgedAt propositalmente ausente → tela de ativação não vista
  })
  await prisma.site.create({
    data: {
      clientId: maria.id,
      siteType: 'mini_site',
      templateUsed: 'Beleza Feminina',
      status: 'pendente_ativacao',
      filesZipUrl: 'https://exemplo.com/arquivos/maria-site.zip',
      notes: 'Salão de beleza. Cliente aprovou o layout via WhatsApp em 10/07.',
    },
  })
  await prisma.referralClick.createMany({
    data: [
      { referralCode: 'MARIA2K4X', clickedAt: daysAgo(5) },
      { referralCode: 'MARIA2K4X', clickedAt: daysAgo(3) },
      { referralCode: 'MARIA2K4X', clickedAt: daysAgo(1) },
    ],
  })
  await prisma.notification.create({
    data: {
      clientId: maria.id,
      title: 'Bem-vinda ao painel!',
      message: 'Seu site está pronto. Ative o plano para colocá-lo no ar ou baixe os arquivos.',
      channel: 'painel',
      read: false,
    },
  })
  console.log('✅ 1. Maria Santos — pendente_ativacao, sem assinatura')

  // ──────────────────────────────────────────────────────────────────────────
  // 2. JOÃO PEREIRA — Plus, online, 5 faturas pagas, tickets, domínio
  // ──────────────────────────────────────────────────────────────────────────
  const joao = await mkClient({
    name: 'João Pereira',
    email: 'joao@teste.com',
    phone: '11922220002',
    referralCode: 'JOAO8P5Q',
    monthlyFeeAcknowledgedAt: monthsAgo(5),
  })
  const joaoSite = await prisma.site.create({
    data: {
      clientId: joao.id,
      siteUrl: 'https://joaopereira.github.io/consultoria',
      siteType: 'mini_site',
      templateUsed: 'Consultoria Financeira',
      status: 'online',
      publishedAt: monthsAgo(5),
      filesZipUrl: 'https://exemplo.com/arquivos/joao-site.zip',
      notes: 'Consultoria financeira. Domínio personalizado configurado.',
    },
  })
  await prisma.domain.create({
    data: {
      siteId: joaoSite.id,
      domain: 'joaofinanceiro.com.br',
      dnsStatus: 'verificado',
      sslStatus: 'ativo',
      verifiedAt: monthsAgo(4),
    },
  })
  const joaoSub = await prisma.subscription.create({
    data: {
      clientId: joao.id,
      planId: planPlus.id,
      status: 'active',
      asaasSubscriptionId: 'sub_demo_joao_plus',
      nextDueDate: daysFromNow(15),
      planActivatedAt: monthsAgo(5),
    },
  })
  for (let i = 5; i >= 1; i--) {
    await prisma.invoice.create({
      data: {
        subscriptionId: joaoSub.id,
        amount: 29.0,
        status: 'paid',
        dueDate: monthsAgo(i),
        paidAt: monthsAgo(i),
        asaasChargeId: `chg_demo_joao_${i}`,
      },
    })
  }
  await prisma.invoice.create({
    data: {
      subscriptionId: joaoSub.id,
      amount: 29.0,
      status: 'pending',
      dueDate: daysFromNow(15),
    },
  })
  await prisma.ticket.create({
    data: {
      clientId: joao.id,
      siteId: joaoSite.id,
      changeType: 'texto',
      textContent: 'Atualizar telefone na seção de contato para (11) 99999-0002.',
      status: 'done',
      isExtraPaid: false,
    },
  })
  await prisma.ticket.create({
    data: {
      clientId: joao.id,
      siteId: joaoSite.id,
      changeType: 'correcao',
      textContent: 'Link do WhatsApp na seção "Fale Conosco" está com número errado.',
      status: 'open',
      isExtraPaid: false,
    },
  })
  await prisma.order.create({
    data: {
      clientId: joao.id,
      productId: prodDominio.id,
      amount: 39.0,
      status: 'delivered',
      asaasChargeId: 'chg_demo_joao_dom',
    },
  })
  await prisma.notification.createMany({
    data: [
      {
        clientId: joao.id,
        title: 'Site publicado!',
        message: 'Seu site joaofinanceiro.com.br está no ar. Compartilhe com seus clientes!',
        channel: 'painel',
        read: true,
      },
      {
        clientId: joao.id,
        title: 'Solicitação concluída',
        message: 'A alteração de texto no número de telefone foi aplicada ao seu site.',
        channel: 'painel',
        read: true,
      },
    ],
  })
  console.log('✅ 2. João Pereira — Plus, online, 5 faturas pagas')

  // ──────────────────────────────────────────────────────────────────────────
  // 3. ANA LIMA — Plus, online, tickets, indicou Carlos (recompensado)
  // ──────────────────────────────────────────────────────────────────────────
  const ana = await mkClient({
    name: 'Ana Lima',
    email: 'ana@teste.com',
    phone: '11933330003',
    referralCode: 'ANAP9R3K',
    monthlyFeeAcknowledgedAt: monthsAgo(4),
  })
  const anaSite = await prisma.site.create({
    data: {
      clientId: ana.id,
      siteUrl: 'https://analima.vercel.app',
      siteType: 'landing_page',
      templateUsed: 'Saúde & Bem-Estar',
      status: 'online',
      publishedAt: monthsAgo(4),
      filesZipUrl: 'https://exemplo.com/arquivos/ana-site.zip',
      notes: 'Nutricionista. Upgrade mini_site → landing_page já realizado.',
    },
  })
  await prisma.domain.create({
    data: {
      siteId: anaSite.id,
      domain: 'analima.com.br',
      dnsStatus: 'verificado',
      sslStatus: 'ativo',
      verifiedAt: monthsAgo(3),
    },
  })
  const anaSub = await prisma.subscription.create({
    data: {
      clientId: ana.id,
      planId: planPlus.id,
      status: 'active',
      asaasSubscriptionId: 'sub_demo_ana_plus2',
      nextDueDate: daysFromNow(8),
      planActivatedAt: monthsAgo(4),
    },
  })
  for (let i = 4; i >= 1; i--) {
    await prisma.invoice.create({
      data: {
        subscriptionId: anaSub.id,
        amount: 29.0,
        status: 'paid',
        dueDate: monthsAgo(i),
        paidAt: monthsAgo(i),
        asaasChargeId: `chg_demo_ana_${i}`,
      },
    })
  }
  await prisma.invoice.create({
    data: {
      subscriptionId: anaSub.id,
      amount: 29.0,
      status: 'pending',
      dueDate: daysFromNow(8),
    },
  })
  await prisma.ticket.create({
    data: {
      clientId: ana.id,
      siteId: anaSite.id,
      changeType: 'texto',
      textContent: 'Adicionar depoimento: "Perdi 8kg em 3 meses com a dieta da Dra. Ana. Incrível!" — Mariana R.',
      status: 'done',
      isExtraPaid: false,
    },
  })
  await prisma.ticket.create({
    data: {
      clientId: ana.id,
      siteId: anaSite.id,
      changeType: 'nova_secao',
      textContent: 'Adicionar seção de FAQ com 5 perguntas frequentes sobre dieta e nutrição.',
      status: 'open',
      isExtraPaid: true,
    },
  })
  await prisma.ticket.create({
    data: {
      clientId: ana.id,
      siteId: anaSite.id,
      changeType: 'correcao',
      textContent: 'Instagram no rodapé está errado: deve ser @analimanutricionista.',
      status: 'in_progress',
      isExtraPaid: false,
    },
  })
  await prisma.order.create({
    data: {
      clientId: ana.id,
      productId: prodSEO.id,
      amount: 149.0,
      status: 'delivered',
      asaasChargeId: 'chg_demo_ana_seo',
    },
  })
  await prisma.order.create({
    data: {
      clientId: ana.id,
      productId: prodUpgradeLanding.id,
      amount: 199.0,
      status: 'delivered',
      asaasChargeId: 'chg_demo_ana_upgrade',
    },
  })
  await prisma.notification.create({
    data: {
      clientId: ana.id,
      title: 'Você ganhou 1 mês grátis!',
      message: 'Seu indicado Carlos Souza ativou o plano. Você ganhou 1 mês grátis na próxima fatura.',
      channel: 'painel',
      read: false,
    },
  })
  console.log('✅ 3. Ana Lima — Plus, online, indicou Carlos (recompensado)')

  // ──────────────────────────────────────────────────────────────────────────
  // 4. CARLOS SOUZA — Básico, online, fatura OVERDUE, indicado por Ana
  // ──────────────────────────────────────────────────────────────────────────
  const carlos = await mkClient({
    name: 'Carlos Souza',
    email: 'carlos@teste.com',
    phone: '11944440004',
    referralCode: 'CARLOSS7',
    monthlyFeeAcknowledgedAt: monthsAgo(3),
  })
  const carlosSite = await prisma.site.create({
    data: {
      clientId: carlos.id,
      siteUrl: 'https://carlossouza.github.io/mecanica',
      siteType: 'mini_site',
      templateUsed: 'Mecânica Automotiva',
      status: 'online',
      publishedAt: monthsAgo(3),
      filesZipUrl: 'https://exemplo.com/arquivos/carlos-site.zip',
      notes: 'Mecânica automotiva. Fatura do mês atual em atraso.',
    },
  })
  const carlosSub = await prisma.subscription.create({
    data: {
      clientId: carlos.id,
      planId: planBasico.id,
      status: 'overdue',
      asaasSubscriptionId: 'sub_demo_carlos_basico',
      nextDueDate: daysAgo(15),
      planActivatedAt: monthsAgo(3),
    },
  })
  for (let i = 3; i >= 2; i--) {
    await prisma.invoice.create({
      data: {
        subscriptionId: carlosSub.id,
        amount: 17.0,
        status: 'paid',
        dueDate: monthsAgo(i),
        paidAt: monthsAgo(i),
        asaasChargeId: `chg_demo_carlos_${i}`,
      },
    })
  }
  await prisma.invoice.create({
    data: {
      subscriptionId: carlosSub.id,
      amount: 17.0,
      status: 'overdue',
      dueDate: daysAgo(15),
    },
  })
  await prisma.ticket.create({
    data: {
      clientId: carlos.id,
      siteId: carlosSite.id,
      changeType: 'correcao',
      textContent: 'Horário de funcionamento estava errado. Correto: segunda a sábado, 8h–18h.',
      status: 'done',
      isExtraPaid: false,
    },
  })
  await prisma.ticket.create({
    data: {
      clientId: carlos.id,
      siteId: carlosSite.id,
      changeType: 'imagem',
      textContent: 'Trocar foto da fachada da oficina.',
      attachmentUrl: 'https://exemplo.com/anexos/fachada-nova.jpg',
      status: 'done',
      isExtraPaid: true,
    },
  })
  await prisma.order.create({
    data: {
      clientId: carlos.id,
      productId: prodAlteracaoImagem.id,
      amount: 40.0,
      status: 'paid',
      asaasChargeId: 'chg_demo_carlos_img',
    },
  })
  await prisma.notification.create({
    data: {
      clientId: carlos.id,
      title: 'Fatura em atraso',
      message: 'Sua fatura de R$17,00 está em atraso. Regularize para evitar suspensão do site.',
      channel: 'painel',
      read: false,
    },
  })
  // Referral: Carlos foi indicado por Ana
  await prisma.referral.create({
    data: {
      referrerClientId: ana.id,
      referredClientId: carlos.id,
      status: 'recompensado',
      rewardMonths: 1,
      rewardedAt: daysAgo(30),
    },
  })
  console.log('✅ 4. Carlos Souza — Básico, fatura overdue, indicado por Ana (recompensado)')

  // ──────────────────────────────────────────────────────────────────────────
  // 5. FERNANDA OLIVEIRA — Plus, online, indicou Pedro (pendente recompensa)
  // ──────────────────────────────────────────────────────────────────────────
  const fernanda = await mkClient({
    name: 'Fernanda Oliveira',
    email: 'fernanda@teste.com',
    phone: '11955550005',
    referralCode: 'FERN8Y2Z',
    monthlyFeeAcknowledgedAt: monthsAgo(2),
  })
  const fernandaSite = await prisma.site.create({
    data: {
      clientId: fernanda.id,
      siteUrl: 'https://fernandaoliveira.vercel.app',
      siteType: 'mini_site',
      templateUsed: 'Moda & Estilo',
      status: 'online',
      publishedAt: monthsAgo(2),
      notes: 'Loja de roupas femininas.',
    },
  })
  const fernandaSub = await prisma.subscription.create({
    data: {
      clientId: fernanda.id,
      planId: planPlus.id,
      status: 'active',
      asaasSubscriptionId: 'sub_demo_fernanda_plus',
      nextDueDate: daysFromNow(20),
      planActivatedAt: monthsAgo(2),
    },
  })
  for (let i = 2; i >= 1; i--) {
    await prisma.invoice.create({
      data: {
        subscriptionId: fernandaSub.id,
        amount: 29.0,
        status: 'paid',
        dueDate: monthsAgo(i),
        paidAt: monthsAgo(i),
        asaasChargeId: `chg_demo_fernanda_${i}`,
      },
    })
  }
  await prisma.invoice.create({
    data: {
      subscriptionId: fernandaSub.id,
      amount: 29.0,
      status: 'pending',
      dueDate: daysFromNow(20),
    },
  })
  await prisma.referralClick.createMany({
    data: [
      { referralCode: 'FERN8Y2Z', clickedAt: daysAgo(20) },
      { referralCode: 'FERN8Y2Z', clickedAt: daysAgo(18) },
    ],
  })
  await prisma.ticket.create({
    data: {
      clientId: fernanda.id,
      siteId: fernandaSite.id,
      changeType: 'texto',
      textContent: 'Adicionar texto da coleção inverno: "Chegou a Coleção Inverno 2026! Peças com até 30% de desconto na estreia."',
      status: 'in_progress',
      isExtraPaid: false,
    },
  })
  await prisma.notification.create({
    data: {
      clientId: fernanda.id,
      title: 'Indicação confirmada!',
      message: 'Pedro Alves se cadastrou com seu link. Quando ele ativar o plano você ganha 1 mês grátis!',
      channel: 'painel',
      read: true,
    },
  })
  console.log('✅ 5. Fernanda Oliveira — Plus, online, indicou Pedro')

  // ──────────────────────────────────────────────────────────────────────────
  // 6. PEDRO ALVES — Básico, online, indicado por Fernanda
  // ──────────────────────────────────────────────────────────────────────────
  const pedro = await mkClient({
    name: 'Pedro Alves',
    email: 'pedro@teste.com',
    phone: '11966660006',
    referralCode: 'PEDROV4T',
    monthlyFeeAcknowledgedAt: monthsAgo(1),
  })
  const pedroSite = await prisma.site.create({
    data: {
      clientId: pedro.id,
      siteUrl: 'https://pedroalves.github.io/barbearia',
      siteType: 'mini_site',
      templateUsed: 'Barbearia Clássica',
      status: 'online',
      publishedAt: monthsAgo(1),
      notes: 'Barbearia no centro de SP.',
    },
  })
  const pedroSub = await prisma.subscription.create({
    data: {
      clientId: pedro.id,
      planId: planBasico.id,
      status: 'active',
      asaasSubscriptionId: 'sub_demo_pedro_basico',
      nextDueDate: daysFromNow(10),
      planActivatedAt: monthsAgo(1),
    },
  })
  await prisma.invoice.create({
    data: {
      subscriptionId: pedroSub.id,
      amount: 17.0,
      status: 'paid',
      dueDate: monthsAgo(1),
      paidAt: monthsAgo(1),
      asaasChargeId: 'chg_demo_pedro_1',
    },
  })
  await prisma.invoice.create({
    data: {
      subscriptionId: pedroSub.id,
      amount: 17.0,
      status: 'pending',
      dueDate: daysFromNow(10),
    },
  })
  await prisma.ticket.create({
    data: {
      clientId: pedro.id,
      siteId: pedroSite.id,
      changeType: 'correcao',
      textContent: 'Telefone mudou. Novo: (11) 98877-6655.',
      status: 'open',
      isExtraPaid: false,
    },
  })
  await prisma.referral.create({
    data: {
      referrerClientId: fernanda.id,
      referredClientId: pedro.id,
      status: 'confirmado',
    },
  })
  // Notificação interna para o admin aplicar recompensa
  await prisma.notification.create({
    data: {
      clientId: null,
      title: 'Indicação ativa — aplicar recompensa [DEMO]',
      message: 'Pedro Alves (indicado por Fernanda Oliveira) ativou o plano. Aplicar 1 mês grátis para Fernanda no Asaas e marcar como recompensado.',
      channel: 'painel',
      read: false,
    },
  })
  console.log('✅ 6. Pedro Alves — Básico, online, indicado por Fernanda')

  // ──────────────────────────────────────────────────────────────────────────
  // 7. LUCIA COSTA — Plus, em manutenção para atualização do site
  // ──────────────────────────────────────────────────────────────────────────
  const lucia = await mkClient({
    name: 'Lucia Costa',
    email: 'lucia@teste.com',
    phone: '11977770007',
    referralCode: 'LUCIAV5M',
    monthlyFeeAcknowledgedAt: monthsAgo(6),
  })
  const luciaSite = await prisma.site.create({
    data: {
      clientId: lucia.id,
      siteUrl: 'https://luciacosta.vercel.app',
      siteType: 'institucional',
      templateUsed: 'Advocacia Moderna',
      status: 'manutencao',
      publishedAt: monthsAgo(6),
      filesZipUrl: 'https://exemplo.com/arquivos/lucia-site.zip',
      notes: 'Escritório de advocacia. Em manutenção para atualização geral do site.',
    },
  })
  const luciaSub = await prisma.subscription.create({
    data: {
      clientId: lucia.id,
      planId: planPlus.id,
      status: 'active',
      asaasSubscriptionId: 'sub_demo_lucia_plus',
      nextDueDate: daysFromNow(5),
      planActivatedAt: monthsAgo(6),
    },
  })
  for (let i = 6; i >= 1; i--) {
    await prisma.invoice.create({
      data: {
        subscriptionId: luciaSub.id,
        amount: 29.0,
        status: 'paid',
        dueDate: monthsAgo(i),
        paidAt: monthsAgo(i),
        asaasChargeId: `chg_demo_lucia_${i}`,
      },
    })
  }
  await prisma.invoice.create({
    data: {
      subscriptionId: luciaSub.id,
      amount: 29.0,
      status: 'pending',
      dueDate: daysFromNow(5),
    },
  })
  await prisma.ticket.create({
    data: {
      clientId: lucia.id,
      siteId: luciaSite.id,
      changeType: 'texto',
      textContent: 'Atualizar bio: "Especialista em Direito de Família e Sucessões, 15 anos de experiência, +500 casos."',
      status: 'in_progress',
      isExtraPaid: false,
    },
  })
  await prisma.ticket.create({
    data: {
      clientId: lucia.id,
      siteId: luciaSite.id,
      changeType: 'nova_pagina',
      textContent: 'Criar página "Artigos" com 3 artigos jurídicos (textos por e-mail).',
      status: 'open',
      isExtraPaid: true,
    },
  })
  await prisma.order.create({
    data: {
      clientId: lucia.id,
      productId: prodNovaPagina.id,
      amount: 70.0,
      status: 'pending',
      asaasChargeId: 'chg_demo_lucia_pag',
    },
  })
  await prisma.notification.create({
    data: {
      clientId: lucia.id,
      title: 'Site em manutenção',
      message: 'Seu site está em manutenção temporária para atualização geral. Em breve estará de volta ao ar.',
      channel: 'painel',
      read: true,
    },
  })
  console.log('✅ 7. Lucia Costa — Plus, em manutenção')

  // ──────────────────────────────────────────────────────────────────────────
  // 8. ROBERTO NUNES — Básico, SUSPENSO, 2 faturas overdue
  // ──────────────────────────────────────────────────────────────────────────
  const roberto = await mkClient({
    name: 'Roberto Nunes',
    email: 'roberto@teste.com',
    phone: '11988880008',
    referralCode: 'ROBN3X2A',
    monthlyFeeAcknowledgedAt: monthsAgo(4),
  })
  const robertoSite = await prisma.site.create({
    data: {
      clientId: roberto.id,
      siteType: 'mini_site',
      templateUsed: 'Eletricista Residencial',
      status: 'suspenso',
      publishedAt: monthsAgo(4),
      notes: 'Suspenso por inadimplência (2 faturas atrasadas).',
    },
  })
  const robertoSub = await prisma.subscription.create({
    data: {
      clientId: roberto.id,
      planId: planBasico.id,
      status: 'overdue',
      asaasSubscriptionId: 'sub_demo_roberto_basico',
      nextDueDate: daysAgo(45),
      planActivatedAt: monthsAgo(4),
    },
  })
  for (let i = 4; i >= 3; i--) {
    await prisma.invoice.create({
      data: {
        subscriptionId: robertoSub.id,
        amount: 17.0,
        status: 'paid',
        dueDate: monthsAgo(i),
        paidAt: monthsAgo(i),
        asaasChargeId: `chg_demo_roberto_${i}`,
      },
    })
  }
  await prisma.invoice.create({
    data: {
      subscriptionId: robertoSub.id,
      amount: 17.0,
      status: 'overdue',
      dueDate: monthsAgo(2),
    },
  })
  await prisma.invoice.create({
    data: {
      subscriptionId: robertoSub.id,
      amount: 17.0,
      status: 'overdue',
      dueDate: daysAgo(45),
    },
  })
  await prisma.notification.create({
    data: {
      clientId: roberto.id,
      title: 'Site suspenso por inadimplência',
      message: 'Seu site foi suspenso. Regularize as faturas em atraso para reativação imediata.',
      channel: 'painel',
      read: false,
    },
  })
  await prisma.notification.create({
    data: {
      clientId: null,
      title: 'Site suspenso — Roberto Nunes [DEMO]',
      message: 'Roberto Nunes tem 2 faturas overdue (R$34,00). Site marcado como suspenso. Considerar retirar do ar.',
      channel: 'painel',
      read: true,
    },
  })
  console.log('✅ 8. Roberto Nunes — Básico, suspenso, 2 faturas overdue')

  // ──────────────────────────────────────────────────────────────────────────
  // 9. SANDRA FERREIRA — Plus, online, comprou logo + nova seção
  // ──────────────────────────────────────────────────────────────────────────
  const sandra = await mkClient({
    name: 'Sandra Ferreira',
    email: 'sandra@teste.com',
    phone: '11999990009',
    referralCode: 'SANDF6W8',
    monthlyFeeAcknowledgedAt: monthsAgo(3),
  })
  const sandraSite = await prisma.site.create({
    data: {
      clientId: sandra.id,
      siteUrl: 'https://sandraferreira.vercel.app',
      siteType: 'mini_site',
      templateUsed: 'Psicologia & Terapia',
      status: 'online',
      publishedAt: monthsAgo(3),
      notes: 'Psicóloga clínica.',
    },
  })
  const sandraSub = await prisma.subscription.create({
    data: {
      clientId: sandra.id,
      planId: planPlus.id,
      status: 'active',
      asaasSubscriptionId: 'sub_demo_sandra_plus',
      nextDueDate: daysFromNow(12),
      planActivatedAt: monthsAgo(3),
    },
  })
  for (let i = 3; i >= 1; i--) {
    await prisma.invoice.create({
      data: {
        subscriptionId: sandraSub.id,
        amount: 29.0,
        status: 'paid',
        dueDate: monthsAgo(i),
        paidAt: monthsAgo(i),
        asaasChargeId: `chg_demo_sandra_${i}`,
      },
    })
  }
  await prisma.invoice.create({
    data: {
      subscriptionId: sandraSub.id,
      amount: 29.0,
      status: 'pending',
      dueDate: daysFromNow(12),
    },
  })
  // Logo com 10% de desconto do plano Plus (97 × 0,9 = 87,30)
  await prisma.order.create({
    data: {
      clientId: sandra.id,
      productId: prodLogo.id,
      amount: 87.3,
      status: 'delivered',
      asaasChargeId: 'chg_demo_sandra_logo',
    },
  })
  // Nova Seção (sempre avulsa)
  await prisma.order.create({
    data: {
      clientId: sandra.id,
      productId: prodNovaSec.id,
      amount: 40.0,
      status: 'paid',
      asaasChargeId: 'chg_demo_sandra_sec',
    },
  })
  await prisma.ticket.create({
    data: {
      clientId: sandra.id,
      siteId: sandraSite.id,
      changeType: 'nova_secao',
      textContent: 'Criar seção de depoimentos com 3 relatos de pacientes anônimos.',
      status: 'in_progress',
      isExtraPaid: true,
    },
  })
  await prisma.notification.create({
    data: {
      clientId: sandra.id,
      title: 'Logo entregue!',
      message: 'Seu logo profissional está disponível. Acesse Solicitações para baixar os arquivos.',
      channel: 'painel',
      read: true,
    },
  })
  console.log('✅ 9. Sandra Ferreira — Plus, online, logo entregue + nova seção')

  // ──────────────────────────────────────────────────────────────────────────
  // 10. MARCOS RIBEIRO — pendente_ativacao, viu a tela, optou por baixar arquivos
  // ──────────────────────────────────────────────────────────────────────────
  const marcos = await mkClient({
    name: 'Marcos Ribeiro',
    email: 'marcos@teste.com',
    phone: '11900010010',
    referralCode: 'MARCR1K9',
    monthlyFeeAcknowledgedAt: daysAgo(2), // viu a tela de ativação
    downloadRetentionShownAt: daysAgo(2), // e viu o popup de retenção antes de baixar
  })
  await prisma.site.create({
    data: {
      clientId: marcos.id,
      siteType: 'mini_site',
      templateUsed: 'Pet Shop & Veterinário',
      status: 'pendente_ativacao',
      filesZipUrl: 'https://exemplo.com/arquivos/marcos-site.zip',
      notes: 'Pet shop. Cliente viu a tela, viu o popup de retenção e baixou os arquivos. Acompanhar.',
    },
  })
  await prisma.notification.create({
    data: {
      clientId: marcos.id,
      title: 'Arquivos do site disponíveis',
      message: 'Você baixou os arquivos do seu site. Quando quiser publicá-lo conosco, ative o plano a qualquer momento.',
      channel: 'painel',
      read: true,
    },
  })
  console.log('✅ 10. Marcos Ribeiro — pendente_ativacao, baixou arquivos')

  // ── Notificação admin: publicar site de Maria (após pagamento simulado) ───
  await prisma.notification.create({
    data: {
      clientId: null,
      title: 'Publicar site — Maria Santos [DEMO]',
      message: 'Maria Santos ativou o Plano Básico (R$17/mês). Publicar o site no GitHub Pages e marcar status como "online".',
      channel: 'painel',
      read: false,
    },
  })

  // ── Promoções demo ─────────────────────────────────────────────────────────
  await prisma.promotion.create({
    data: {
      productId: prodLogo.id,
      title: '[DEMO] Oferta de Lançamento — Logo Profissional',
      description: 'Crie sua identidade visual com 20% de desconto especial. Válido até o final do mês.',
      discountType: 'percent',
      discountValue: 20.0,
      startDate: daysAgo(10),
      endDate: daysFromNow(20),
      active: true,
    },
  })
  await prisma.promotion.create({
    data: {
      productId: null,
      title: '[DEMO] Julho Especial — R$30 off em qualquer upsell',
      description: 'Aproveite julho com R$30 de desconto em qualquer serviço avulso ou upsell.',
      discountType: 'fixed',
      discountValue: 30.0,
      startDate: daysAgo(13),
      endDate: daysFromNow(18),
      active: true,
    },
  })
  console.log('\n✅ 2 promoções demo criadas')

  // ── Custos — 3 meses (mai / jun / jul 2026) ────────────────────────────────
  await prisma.cost.createMany({
    data: [
      // Maio (3 meses atrás)
      { category: 'ia', description: '[DEMO] ChatGPT Plus', amount: 110.0, costDate: monthsAgo(3), isRecurring: true, recurrenceFrequency: 'mensal' },
      { category: 'ia', description: '[DEMO] Midjourney', amount: 60.0, costDate: monthsAgo(3), isRecurring: true, recurrenceFrequency: 'mensal' },
      { category: 'trafego_pago', description: '[DEMO] Meta Ads — Campanha Maio', amount: 450.0, costDate: monthsAgo(3), isRecurring: false, recurrenceFrequency: null },
      { category: 'hospedagem_ferramentas', description: '[DEMO] Vercel Pro', amount: 100.0, costDate: monthsAgo(3), isRecurring: true, recurrenceFrequency: 'mensal' },
      { category: 'hospedagem_ferramentas', description: '[DEMO] Supabase', amount: 50.0, costDate: monthsAgo(3), isRecurring: true, recurrenceFrequency: 'mensal' },
      { category: 'hospedagem_ferramentas', description: '[DEMO] Resend', amount: 20.0, costDate: monthsAgo(3), isRecurring: true, recurrenceFrequency: 'mensal' },
      { category: 'outro', description: '[DEMO] Domínio da plataforma (anual)', amount: 60.0, costDate: monthsAgo(3), isRecurring: false, recurrenceFrequency: null },
      // Junho (2 meses atrás)
      { category: 'ia', description: '[DEMO] ChatGPT Plus', amount: 110.0, costDate: monthsAgo(2), isRecurring: true, recurrenceFrequency: 'mensal' },
      { category: 'ia', description: '[DEMO] Midjourney', amount: 60.0, costDate: monthsAgo(2), isRecurring: true, recurrenceFrequency: 'mensal' },
      { category: 'trafego_pago', description: '[DEMO] Meta Ads — Campanha Junho', amount: 600.0, costDate: monthsAgo(2), isRecurring: false, recurrenceFrequency: null },
      { category: 'hospedagem_ferramentas', description: '[DEMO] Vercel Pro', amount: 100.0, costDate: monthsAgo(2), isRecurring: true, recurrenceFrequency: 'mensal' },
      { category: 'hospedagem_ferramentas', description: '[DEMO] Supabase', amount: 50.0, costDate: monthsAgo(2), isRecurring: true, recurrenceFrequency: 'mensal' },
      { category: 'hospedagem_ferramentas', description: '[DEMO] Resend', amount: 20.0, costDate: monthsAgo(2), isRecurring: true, recurrenceFrequency: 'mensal' },
      { category: 'outro', description: '[DEMO] Assinatura Notion', amount: 32.0, costDate: monthsAgo(2), isRecurring: true, recurrenceFrequency: 'mensal' },
      // Julho (mês atual)
      { category: 'ia', description: '[DEMO] ChatGPT Plus', amount: 110.0, costDate: daysAgo(5), isRecurring: true, recurrenceFrequency: 'mensal' },
      { category: 'ia', description: '[DEMO] Midjourney', amount: 60.0, costDate: daysAgo(5), isRecurring: true, recurrenceFrequency: 'mensal' },
      { category: 'ia', description: '[DEMO] Claude API (geração de sites)', amount: 80.0, costDate: daysAgo(3), isRecurring: false, recurrenceFrequency: null },
      { category: 'trafego_pago', description: '[DEMO] Meta Ads — Campanha Julho', amount: 500.0, costDate: daysAgo(10), isRecurring: false, recurrenceFrequency: null },
      { category: 'hospedagem_ferramentas', description: '[DEMO] Vercel Pro', amount: 100.0, costDate: daysAgo(5), isRecurring: true, recurrenceFrequency: 'mensal' },
      { category: 'hospedagem_ferramentas', description: '[DEMO] Supabase', amount: 50.0, costDate: daysAgo(5), isRecurring: true, recurrenceFrequency: 'mensal' },
      { category: 'hospedagem_ferramentas', description: '[DEMO] Resend', amount: 20.0, costDate: daysAgo(5), isRecurring: true, recurrenceFrequency: 'mensal' },
      { category: 'outro', description: '[DEMO] Assinatura Notion', amount: 32.0, costDate: daysAgo(5), isRecurring: true, recurrenceFrequency: 'mensal' },
      { category: 'outro', description: '[DEMO] Compra de template base', amount: 150.0, costDate: daysAgo(7), isRecurring: false, recurrenceFrequency: null },
    ],
  })
  console.log('✅ 23 lançamentos de custos criados (3 meses)\n')

  // ── Resumo ──────────────────────────────────────────────────────────────────
  console.log('═'.repeat(62))
  console.log('  🎉  SEED DE DEMONSTRAÇÃO CONCLUÍDO')
  console.log('═'.repeat(62))
  console.log()
  console.log('  ADMIN')
  console.log('    alisonlima977@gmail.com  /  admin123')
  console.log()
  console.log('  CLIENTES DE TESTE  (senha: cliente123)')
  console.log()
  console.log('  #   E-mail                 Situação')
  console.log('  ─────────────────────────────────────────────────────────')
  console.log('  1   maria@teste.com        pendente_ativacao, SEM assinatura')
  console.log('  2   joao@teste.com         Plus, online, 5 faturas pagas')
  console.log('  3   ana@teste.com          Plus, online, indicou Carlos (recompensado)')
  console.log('  4   carlos@teste.com       Básico, online, fatura OVERDUE')
  console.log('  5   fernanda@teste.com     Plus, online, indicou Pedro (pendente)')
  console.log('  6   pedro@teste.com        Básico, online, indicado por Fernanda')
  console.log('  7   lucia@teste.com        Plus, em manutenção')
  console.log('  8   roberto@teste.com      Básico, SUSPENSO, 2 faturas overdue')
  console.log('  9   sandra@teste.com       Plus, online, logo entregue + nova seção')
  console.log(' 10   marcos@teste.com       pendente_ativacao, viu tela, baixou arquivos')
  console.log()
  console.log('═'.repeat(62))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
