const ASAAS_BASE_URL = 'https://api.asaas.com/v3'

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    access_token: process.env.ASAAS_API_KEY ?? '',
  }
}

export async function asaasFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${ASAAS_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Asaas API error [${res.status}]: ${error}`)
  }

  return res.json() as Promise<T>
}

export function validateAsaasWebhook(token: string): boolean {
  return token === process.env.ASAAS_WEBHOOK_TOKEN
}
