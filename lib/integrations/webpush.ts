export async function sendPushToClient(
  clientId: string,
  title: string,
  body: string,
  url: string = '/painel',
): Promise<void> {
  try {
    const { prisma } = await import('@/lib/prisma')

    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
    const vapidEmail = process.env.VAPID_EMAIL ?? 'mailto:contato@topsitebr.com.br'

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn('[push] VAPID keys not configured — push skipped')
      return
    }

    const webpush = await import('web-push').catch(() => null)
    if (!webpush) {
      console.warn('[push] web-push not available — push skipped')
      return
    }

    webpush.default.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey)

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { clientId },
    })

    if (subscriptions.length === 0) {
      console.log(`[push] no subscriptions for clientId=${clientId}`)
      return
    }

    console.log(`[push] sending to clientId=${clientId}, subscriptions=${subscriptions.length}, title="${title}"`)

    const payload = JSON.stringify({ title, body, url })

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.default.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        ).then(() => {
          console.log(`[push] sent ok endpoint=${sub.endpoint.slice(-20)}`)
        }).catch(async (err: { statusCode?: number; message?: string }) => {
          console.error(`[push] failed endpoint=${sub.endpoint.slice(-20)} status=${err?.statusCode} msg=${err?.message}`)
          if (err?.statusCode === 410) {
            await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } })
            console.log(`[push] removed stale subscription`)
          }
        })
      )
    )

    console.log(`[push] done, results=${results.length}`)
  } catch (err) {
    console.error('[push] unexpected error:', err instanceof Error ? err.message : err)
  }
}
