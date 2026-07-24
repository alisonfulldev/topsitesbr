import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // ── Plans ──────────────────────────────────────────────────────────────────
  const plans = [
    {
      name: 'Site no Ar',
      price: 29.0,
      monthlyChangesIncluded: 1,
      prioritySupport: false,
      allowedChangeTypes: 'texto,imagem',
      changeDeadlineDays: 7,
      discountPercent: 10,
    },
  ]

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    })
    console.log(`✅ Plano "${plan.name}" criado/atualizado`)
  }

  // ── Products (avulsos de manutenção) ───────────────────────────────────────
  const avulsaProducts = [
    { name: 'Alteração de Texto (avulsa)', price: 20.0, type: 'service' as const },
    { name: 'Alteração de Imagem (avulsa)', price: 40.0, type: 'service' as const },
    { name: 'Alteração de Texto e Imagem (avulsa)', price: 60.0, type: 'service' as const },
    { name: 'Nova Seção', price: 50.0, type: 'service' as const },
    { name: 'Nova Página', price: 97.0, type: 'service' as const },
  ]

  for (const product of avulsaProducts) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } })
    if (!existing) {
      await prisma.product.create({ data: product })
      console.log(`✅ Produto "${product.name}" criado`)
    } else {
      await prisma.product.update({ where: { id: existing.id }, data: product })
      console.log(`✅ Produto "${product.name}" atualizado`)
    }
  }

  // ── Products (upsells visíveis na loja) ────────────────────────────────────
  const upsellProducts = [
    {
      name: 'Upgrade para Landing Page',
      price: 199.0,
      type: 'upgrade_site' as const,
      eligibleSiteTypes: 'mini_site',
    },
    {
      name: 'Upgrade para Site Institucional',
      price: 299.0,
      type: 'upgrade_site' as const,
      eligibleSiteTypes: 'mini_site,landing_page',
    },
    { name: 'Logo Profissional', price: 97.0, type: 'service' as const },
    { name: 'Configuração de Tráfego Pago', price: 197.0, type: 'service' as const },
  ]

  for (const product of upsellProducts) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } })
    if (!existing) {
      await prisma.product.create({ data: product })
      console.log(`✅ Produto upsell "${product.name}" criado`)
    } else {
      await prisma.product.update({ where: { id: existing.id }, data: product })
      console.log(`✅ Produto upsell "${product.name}" atualizado`)
    }
  }

  // ── Admin user ─────────────────────────────────────────────────────────────
  const adminEmail = 'alisonlima977@gmail.com'
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 12)
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        active: true,
      },
    })
    console.log(`✅ Usuário admin criado: ${adminEmail} / admin123`)
  } else {
    console.log(`ℹ️  Usuário admin já existe: ${adminEmail}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
