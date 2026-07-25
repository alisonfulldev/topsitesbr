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

  const baseUrl = cleanEnv === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://sandbox.asaas.com/api/v3'

  let asaasStatus = 0
  let asaasBody = ''
  try {
    const res = await fetch(`${baseUrl}/customers?limit=1`, {
      headers: { 'Content-Type': 'application/json', access_token: cleanKey },
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
    keyLen: cleanKey.length,
    keyPrefix: cleanKey.substring(0, 25),
    baseUrl,
    asaasStatus,
    asaasBody: asaasBody.substring(0, 500),
  })
}
