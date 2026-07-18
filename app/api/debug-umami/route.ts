import { NextResponse } from 'next/server'

export async function GET() {
  const apiUrl = process.env.UMAMI_API_URL
  const username = process.env.UMAMI_USERNAME
  const password = process.env.UMAMI_PASSWORD
  const apiKey = process.env.UMAMI_API_KEY

  const envCheck = {
    UMAMI_API_URL: apiUrl ?? 'MISSING',
    UMAMI_USERNAME: username ? 'SET' : 'MISSING',
    UMAMI_PASSWORD: password ? 'SET' : 'MISSING',
    UMAMI_API_KEY: apiKey ? 'SET' : 'MISSING',
  }

  if (!apiUrl || (!username && !apiKey)) {
    return NextResponse.json({ step: 'env', envCheck })
  }

  let token: string | null = null
  let loginError: string | null = null
  try {
    const res = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
    })
    const data = await res.json()
    token = data?.token ?? null
    if (!token) loginError = `status ${res.status}: ${JSON.stringify(data)}`
  } catch (e) {
    loginError = String(e)
  }

  if (!token) {
    return NextResponse.json({ step: 'auth', envCheck, loginError })
  }

  const websiteId = '7cd11197-5137-4e75-a703-0bebe2e21fc2'
  const startAt = new Date('2026-07-01').getTime()
  const endAt = new Date('2026-07-18T23:59:59').getTime()

  let statsData: unknown = null
  let statsError: string | null = null
  try {
    const res = await fetch(
      `${apiUrl}/api/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
    )
    statsData = await res.json()
    if (!res.ok) statsError = `status ${res.status}`
  } catch (e) {
    statsError = String(e)
  }

  return NextResponse.json({ step: 'done', envCheck, tokenOk: true, statsData, statsError })
}
