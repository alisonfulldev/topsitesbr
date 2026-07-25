import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('s')
  if (secret !== process.env.NEXTAUTH_SECRET?.substring(0, 8)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const rawEnv = process.env.ASAAS_ENV ?? ''
  const rawKey = process.env.ASAAS_API_KEY ?? ''
  const cleanKey = rawKey.replace(/\s/g, '')
  const cleanEnv = rawEnv.trim()

  // Decode base64 if value doesn't start with $ (production Vercel stores as b64)
  let resolvedKey = cleanKey
  let isBase64 = false
  if (!cleanKey.startsWith('$') && cleanKey.length > 0) {
    try {
      resolvedKey = Buffer.from(cleanKey, 'base64').toString('utf-8').replace(/\s/g, '')
      isBase64 = true
    } catch {
      resolvedKey = cleanKey
    }
  }

  const baseUrl = cleanEnv === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://sandbox.asaas.com/api/v3'

  let asaasStatus = 0
  let asaasBody = ''
  try {
    const res = await fetch(`${baseUrl}/customers?limit=1`, {
      headers: { 'Content-Type': 'application/json', access_token: resolvedKey },
    })
    asaasStatus = res.status
    asaasBody = await res.text()
  } catch (e) {
    asaasBody = String(e)
  }

  return NextResponse.json({
    envRaw: JSON.stringify(rawEnv),
    envClean: cleanEnv,
    envMatches: cleanEnv === 'production',
    rawKeyLen: cleanKey.length,
    isBase64,
    keyLen: resolvedKey.length,
    keyPrefix: resolvedKey.substring(0, 25),
    baseUrl,
    asaasStatus,
    asaasBody: asaasBody.substring(0, 500),
  })
}
