// Dispara uma rota de cron dentro do próprio container, com o CRON_SECRET.
// Uso: node scripts/run-cron.mjs due-date-reminder
// Substitui os "crons" do vercel.json quando o app roda em VPS.

const job = process.argv[2]
if (!job || !/^[a-z0-9-]+$/.test(job)) {
  console.error('Uso: node scripts/run-cron.mjs <nome-do-cron>')
  process.exit(1)
}
if (!process.env.CRON_SECRET) {
  console.error('CRON_SECRET não definido')
  process.exit(1)
}

const port = process.env.PORT || 3000
const url = `http://127.0.0.1:${port}/api/cron/${job}`

try {
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    signal: AbortSignal.timeout(10 * 60 * 1000),
  })
  const body = await res.text()
  console.log(`[cron ${job}] HTTP ${res.status} ${body.slice(0, 500)}`)
  process.exit(res.ok ? 0 : 1)
} catch (err) {
  console.error(`[cron ${job}] falhou:`, err)
  process.exit(1)
}
