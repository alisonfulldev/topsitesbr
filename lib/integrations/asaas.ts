// ASAAS_ENV=sandbox usa https://sandbox.asaas.com/api/v3
// ASAAS_ENV=production usa https://api.asaas.com/v3 (padrão)
function getBaseUrl(): string {
  return (process.env.ASAAS_ENV ?? '').trim() === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://sandbox.asaas.com/api/v3'
}

function getApiKey(): string {
  const raw = (process.env.ASAAS_API_KEY ?? '').replace(/\s/g, '')
  // Vercel substitutes $ as variable references, so the key is stored base64-encoded.
  // If the value doesn't start with $ it's base64 — decode it; otherwise use as-is (local dev).
  if (!raw.startsWith('$') && raw.length > 0) {
    try {
      return Buffer.from(raw, 'base64').toString('utf-8').replace(/\s/g, '')
    } catch {
      return raw
    }
  }
  let key = raw
  if (key.charCodeAt(0) === 0xFEFF) key = key.slice(1)
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
