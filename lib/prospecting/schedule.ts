// Datas da sequência no fuso America/Sao_Paulo.
// O Brasil não tem horário de verão desde 2019, então o fuso é fixo em UTC-3.
const SP_OFFSET_MS = 3 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

export interface SendWindow {
  windowStart: string // "HH:MM"
  windowEnd: string
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// Dia (meia-noite UTC do dia civil em São Paulo), dia da semana e minutos do dia em São Paulo
function spParts(date: Date) {
  const shifted = new Date(date.getTime() - SP_OFFSET_MS)
  return {
    day: Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()),
    weekday: shifted.getUTCDay(),
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
  }
}

// Instante correspondente a "dia + minutos" no horário de São Paulo
function spInstant(day: number, minutes: number) {
  return new Date(day + minutes * 60 * 1000 + SP_OFFSET_MS)
}

function isBusinessDay(day: number) {
  const weekday = new Date(day).getUTCDay()
  return weekday >= 1 && weekday <= 5
}

function nextBusinessDay(day: number) {
  let d = day
  while (!isBusinessDay(d)) d += DAY_MS
  return d
}

export function isWithinSendWindow(now: Date, window: SendWindow) {
  const { weekday, minutes } = spParts(now)
  return weekday >= 1 && weekday <= 5 && minutes >= toMinutes(window.windowStart) && minutes < toMinutes(window.windowEnd)
}

// Início e fim do dia de hoje em São Paulo (para o limite diário e para "envios do dia")
export function spDayBounds(now: Date) {
  const { day } = spParts(now)
  return { start: spInstant(day, 0), end: spInstant(day, 24 * 60) }
}

// Primeiro envio: agora, se estiver dentro da janela num dia útil; senão, o próximo início de janela
export function firstSendAt(now: Date, window: SendWindow) {
  if (isWithinSendWindow(now, window)) return now
  const { day, minutes } = spParts(now)
  const start = toMinutes(window.windowStart)
  const target = isBusinessDay(day) && minutes < start ? day : nextBusinessDay(day + DAY_MS)
  return spInstant(target, start)
}

// Próximo envio a partir do anterior: soma o intervalo em dias e, se cair no fim de semana,
// empurra para o próximo dia útil. Sempre no início da janela.
export function nextSendAt(previous: Date, gapDays: number, window: SendWindow) {
  const { day } = spParts(previous)
  return spInstant(nextBusinessDay(day + gapDays * DAY_MS), toMinutes(window.windowStart))
}

// Datas de todos os passos a partir de um passo já definido (o primeiro, ou o último enviado)
export function scheduleFrom(base: Date, fromStep: number, cadenceDays: number[], window: SendWindow) {
  const dates: { step: number; at: Date }[] = []
  let previous = base
  for (let step = fromStep + 1; step <= cadenceDays.length; step++) {
    const gap = cadenceDays[step - 1] - cadenceDays[step - 2]
    previous = nextSendAt(previous, Math.max(gap, 0), window)
    dates.push({ step, at: previous })
  }
  return dates
}
