import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const plans = [
    {
      name: 'Básico',
      price: 17.0,
      monthlyChangesIncluded: 0,
      prioritySupport: false,
      allowedChangeTypes: '',
    },
    {
      name: 'Plus',
      price: 29.0,
      monthlyChangesIncluded: 1,
      prioritySupport: false,
      allowedChangeTypes: 'texto,imagem',
    },
    {
      name: 'Pro',
      price: 55.0,
      monthlyChangesIncluded: 2,
      prioritySupport: true,
      allowedChangeTypes: 'texto,imagem,texto_e_imagem',
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
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
