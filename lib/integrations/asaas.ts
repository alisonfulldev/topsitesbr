// ASAAS_ENV=sandbox usa https://sandbox.asaas.com/api/v3
// ASAAS_ENV=production usa https://api.asaas.com/v3 (padrão)
function getBaseUrl(): string {
  return process.env.ASAAS_ENV === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://sandbox.asaas.com/api/v3'
}

function getApiKey(): string {
  // Strip BOM, whitespace and any embedded newlines (can sneak in via Vercel CLI pipe on Windows)
  let key = (process.env.ASAAS_API_KEY ?? '').replace(/\s/g, '')
  if (key.charCodeAt(0) === 0xFEFF) key = key.slice(1)
  console.log(`[Asaas] key len=${key.length} prefix=${key.substring(0, 20)} env=${process.env.ASAAS_ENV}`)
  return key
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    access_token: getApiKey(),
  }
}

interface AsaasErrorBody {
  errors?: Array<{ code: string; description: string }>
}

export async function asaasFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const text = await res.text()
      console.error(`[Asaas] ${res.status} ${path}:`, text)
      const body = JSON.parse(text) as AsaasErrorBody
      msg = body.errors?.[0]?.description ?? (text || msg)
    } catch {
      msg = `HTTP ${res.status}`
    }
    throw new Error(`Asaas: ${msg}`)
  }

  return res.json() as Promise<T>
}

export async function getAsaasInvoiceUrl(chargeId: string): Promise<string | null> {
  try {
    const payment = await asaasFetch<{ invoiceUrl: string }>(`/payments/${chargeId}`)
    return payment.invoiceUrl ?? null
  } catch {
    return null
  }
}

export function validateAsaasWebhook(token: string): boolean {
  return (
    !!process.env.ASAAS_WEBHOOK_TOKEN &&
    token === process.env.ASAAS_WEBHOOK_TOKEN
  )
}
