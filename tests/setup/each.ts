import { afterAll, beforeEach, vi } from 'vitest'

// Trava de segurança: os testes só rodam contra o Postgres embutido local
const url = process.env.DATABASE_URL ?? ''
if (!/^postgresql:\/\/[^@]+@127\.0\.0\.1:\d+\/topsite_test$/.test(url)) {
  throw new Error(`Testes abortados: DATABASE_URL não é o banco de teste local (${url.replace(/:[^:@]*@/, ':***@')})`)
}

// Next.js: revalidatePath/headers não existem fora do servidor
vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

// Push notification: sem chaves VAPID nos testes
vi.mock('@/lib/integrations/webpush', () => ({ sendPushToClient: vi.fn(async () => {}), sendPush: vi.fn(async () => {}) }))

beforeEach(async () => {
  const { prisma } = await import('@/lib/prisma')
  // Zera todas as tabelas entre os testes (mantém o schema)
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`
  if (tables.length) {
    await prisma.$executeRawUnsafe(`TRUNCATE ${tables.map((t) => `"${t.tablename}"`).join(', ')} RESTART IDENTITY CASCADE`)
  }
})

afterAll(async () => {
  const { prisma } = await import('@/lib/prisma')
  await prisma.$disconnect()
})
