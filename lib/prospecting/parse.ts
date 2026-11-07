// Leitura do bloco colado pelo admin. Código puro (sem banco): roda no navegador e no servidor.
//
// Formato: uma chave em MAIÚSCULAS por linha ("NOME: Maria"); o valor vai até a próxima chave,
// então os corpos dos e-mails podem ter várias linhas. Vários blocos são separados por "=====".

export const EMAIL_STEPS = 5

export interface ParsedEmail {
  step: number
  subject: string
  body: string
}

export interface ParsedProspect {
  name: string
  email: string
  business: string
  segment: string | null
  site: string | null
  score: number | null
  emails: ParsedEmail[]
}

export interface ParsedBlock {
  index: number
  data: ParsedProspect | null
  errors: string[]
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidEmail(email: string) {
  return EMAIL_RE.test(email)
}

const BASE_KEYS = ['NOME', 'EMAIL', 'NEGOCIO', 'SEGMENTO', 'SITE', 'NOTA'] as const
const STEP_KEYS = Array.from({ length: EMAIL_STEPS }, (_, i) => [`EMAIL${i + 1}_ASSUNTO`, `EMAIL${i + 1}_CORPO`]).flat()
const ALL_KEYS = new Set<string>([...BASE_KEYS, ...STEP_KEYS])

// Só reconhece chaves em maiúsculas no começo da linha — "Site:" dentro de um corpo não vira chave
const KEY_LINE = /^(NOME|EMAIL|NEG[OÓ]CIO|SEGMENTO|SITE|NOTA|EMAIL\d+_(?:ASSUNTO|CORPO))\s*:\s?(.*)$/

export function splitBlocks(text: string): string[] {
  return text
    .replace(/\r\n?/g, '\n')
    .split(/^\s*={5,}\s*$/m)
    .map((block) => block.trim())
    .filter(Boolean)
}

export function parseBlock(text: string, index = 0): ParsedBlock {
  const errors: string[] = []
  const values = new Map<string, string>()
  let current: string | null = null
  let buffer: string[] = []

  const flush = () => {
    if (current) values.set(current, buffer.join('\n').trim())
  }

  for (const line of text.replace(/\r\n?/g, '\n').split('\n')) {
    const match = KEY_LINE.exec(line)
    if (match) {
      flush()
      const key = match[1].replace('NEGÓCIO', 'NEGOCIO')
      if (!ALL_KEYS.has(key)) {
        errors.push(`Chave desconhecida: ${key} (os e-mails vão de EMAIL1 a EMAIL${EMAIL_STEPS}).`)
        current = null
        buffer = []
        continue
      }
      if (values.has(key)) errors.push(`A chave ${key} aparece mais de uma vez.`)
      current = key
      buffer = [match[2]]
    } else if (current) {
      buffer.push(line)
    } else if (line.trim()) {
      errors.push(`Texto antes da primeira chave: "${line.trim().slice(0, 40)}". Toda linha precisa estar depois de uma chave como "NOME:".`)
    }
  }
  flush()

  const get = (key: string) => values.get(key)?.trim() ?? ''
  const required = (key: string, label = key) => {
    if (!values.has(key)) errors.push(`Falta a chave ${label}.`)
    else if (!get(key)) errors.push(`A chave ${label} está vazia.`)
    return get(key)
  }

  const name = required('NOME')
  const email = required('EMAIL').toLowerCase()
  const business = required('NEGOCIO')
  if (email && !isValidEmail(email)) errors.push(`EMAIL inválido: "${email}".`)

  let score: number | null = null
  const rawScore = get('NOTA')
  if (rawScore) {
    const n = Number(rawScore.replace(',', '.'))
    if (Number.isFinite(n)) score = n
    else errors.push(`NOTA precisa ser um número (veio "${rawScore}").`)
  }

  const emails: ParsedEmail[] = []
  for (let step = 1; step <= EMAIL_STEPS; step++) {
    const subject = required(`EMAIL${step}_ASSUNTO`)
    const body = required(`EMAIL${step}_CORPO`)
    if (subject.includes('\n')) errors.push(`EMAIL${step}_ASSUNTO tem mais de uma linha — o corpo deve ir em EMAIL${step}_CORPO.`)
    emails.push({ step, subject, body })
  }

  return {
    index,
    errors,
    data: errors.length ? null : { name, email, business, segment: get('SEGMENTO') || null, site: get('SITE') || null, score, emails },
  }
}

export function parseBlocks(text: string): ParsedBlock[] {
  const blocks = splitBlocks(text).map((block, i) => parseBlock(block, i + 1))
  // E-mail repetido dentro do mesmo lote
  const seen = new Map<string, number>()
  for (const block of blocks) {
    if (!block.data) continue
    const first = seen.get(block.data.email)
    if (first) {
      block.errors.push(`O e-mail ${block.data.email} já aparece no bloco ${first} deste lote.`)
      block.data = null
    } else {
      seen.set(block.data.email, block.index)
    }
  }
  return blocks
}
