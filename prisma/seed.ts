import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // ── Plans ──────────────────────────────────────────────────────────────────
  const plans = [
    {
      name: 'Básico',
      price: 17.0,
      monthlyChangesIncluded: 0,
      prioritySupport: false,
      allowedChangeTypes: '',
      changeDeadlineDays: 15,
      discountPercent: 0,
    },
    {
      name: 'Plus',
      price: 29.0,
      monthlyChangesIncluded: 1,
      prioritySupport: false,
      allowedChangeTypes: 'texto,imagem',
      changeDeadlineDays: 7,
      discountPercent: 10,
    },
    {
      name: 'Pro',
      price: 55.0,
      monthlyChangesIncluded: 2,
      prioritySupport: true,
      allowedChangeTypes: 'texto,imagem,texto_e_imagem',
      changeDeadlineDays: 3,
      discountPercent: 20,
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
    { name: 'Nova Seção', price: 40.0, type: 'service' as const },
    { name: 'Nova Página', price: 70.0, type: 'service' as const },
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
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
