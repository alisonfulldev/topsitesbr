// Minimal web push sender using the Web Push Protocol
// We use the 'web-push' npm package approach but implement it lightly.
// For production, install 'web-push': npm install web-push
// For now we use fetch with VAPID manually — but since web-push is complex,
// we'll use a simple approach: store subscriptions and send via web-push library.

export async function sendPushToClient(
  clientId: string,
  title: string,
  body: string,
  url: string = '/painel',
): Promise<void> {
  // Dynamic import to avoid issues if web-push is not installed
  try {
    const { prisma } = await import('@/lib/prisma')
    const webpush = await import('web-push').catch(() => null)
    if (!webpush) return

    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
    const vapidEmail = process.env.VAPID_EMAIL ?? 'mailto:contato@topsitebr.com.br'
    if (!vapidPublicKey || !vapidPrivateKey) return

    webpush.default.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey)

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { clientId },
    })

    const payload = JSON.stringify({ title, body, url })

    await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.default.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
        ).catch(async (err: { statusCode?: number }) => {
          // Remove expired/invalid subscriptions (410 = gone)
          if (err?.statusCode === 410) {
            await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } })
          }
        })
      )
    )
  } catch {
    // Push is optional — don't break the main flow
  }
}
