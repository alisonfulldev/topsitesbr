import { defineConfig } from 'vitest/config'
import path from 'path'

// Testes de pagamento: unitários (funções puras) e de integração (Postgres embutido, nunca o de produção).
// Rodar: npm test
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname) },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    globalSetup: ['tests/setup/global.ts'],
    setupFiles: ['tests/setup/each.ts'],
    // Um arquivo por vez: todos compartilham o mesmo banco de teste
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 180_000,
  },
})
