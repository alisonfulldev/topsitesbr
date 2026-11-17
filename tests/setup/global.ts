import EmbeddedPostgres from 'embedded-postgres'
import { execSync } from 'child_process'
import path from 'path'
import os from 'os'
import fs from 'fs'
import net from 'net'

// Sobe um Postgres embutido só para os testes, cria o schema com o Prisma e desliga ao final.
// O banco de produção nunca é usado: as variáveis abaixo sobrescrevem o .env.
// Porta livre a cada execução (uma porta presa de uma execução anterior não atrapalha)
function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer()
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address() as net.AddressInfo
      srv.close(() => resolve(port))
    })
    srv.on('error', reject)
  })
}

let pg: EmbeddedPostgres | undefined

export async function setup() {
  const PORT = await freePort()
  const TEST_DB_URL = `postgresql://postgres:postgres@127.0.0.1:${PORT}/topsite_test`
  const dataDir = path.join(os.tmpdir(), `topsite-test-pg-${process.pid}`)
  fs.rmSync(dataDir, { recursive: true, force: true })
  pg = new EmbeddedPostgres({ databaseDir: dataDir, user: 'postgres', password: 'postgres', port: PORT, persistent: true, onLog: () => {}, onError: () => {} })
  await pg.initialise()
  await pg.start()
  await pg.createDatabase('topsite_test')

  Object.assign(process.env, {
    DATABASE_URL: TEST_DB_URL,
    DIRECT_URL: TEST_DB_URL,
    PAYMENT_DRIVER: 'asaas', // as chamadas ao Asaas são simuladas nos testes (vi.mock)
    ASAAS_ENV: 'sandbox',
    RESEND_API_KEY: 'mock',
    NEXTAUTH_SECRET: 'segredo-de-teste',
    NEXT_PUBLIC_APP_URL: 'https://topsitebr.com.br',
    ADMIN_NOTIFICATION_EMAIL: 'admin@teste.local',
    VAPID_PUBLIC_KEY: '',
    VAPID_PRIVATE_KEY: '',
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: '',
  })

  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    cwd: path.resolve(__dirname, '../..'),
    env: process.env,
    stdio: 'pipe',
  })
}

export async function teardown() {
  await pg?.stop()
  // Limpeza tolerante: no Windows o Postgres pode segurar os arquivos por alguns instantes
  try { fs.rmSync(dataDirOf(), { recursive: true, force: true }) } catch { /* fica para a próxima limpeza do sistema */ }
}

function dataDirOf() {
  return path.join(os.tmpdir(), `topsite-test-pg-${process.pid}`)
}
