import { describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma'
import { client } from './helpers/factories'

describe('infraestrutura de teste', () => {
  it('usa o Postgres embutido local, nunca o de produção', () => {
    expect(process.env.DATABASE_URL).toMatch(/^postgresql:\/\/[^@]+@127\.0\.0\.1:\d+\/topsite_test$/)
    expect(process.env.DATABASE_URL).not.toMatch(/supabase/)
  })

  it('cria e lê dados no banco de teste', async () => {
    const c = await client({ name: 'Fulano' })
    expect(await prisma.client.count()).toBe(1)
    expect((await prisma.client.findUniqueOrThrow({ where: { id: c.id } })).name).toBe('Fulano')
  })
})
