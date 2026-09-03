import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { NotificationBell } from '@/components/notification-bell'
import { PainelDesktopSidebar, PainelBottomNav } from '@/components/painel/PainelNav'
import { PwaSetup } from '@/components/painel/PwaSetup'
import { PwaInstallModal } from '@/components/painel/PwaInstallModal'
import { ReferralPopupWrapper } from '@/components/painel/ReferralPopupWrapper'
import { ImpersonationBanner } from '@/components/painel/ImpersonationBanner'
import Image from 'next/image'
import { markNotificationRead, markAllNotificationsRead } from './actions'
import { getImpersonationContext } from '@/lib/impersonation'

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Allow admin access only when impersonating
  const imp = session.user.role === 'admin'
    ? await getImpersonationContext(session)
    : null
  if (session.user.role === 'admin' && !imp) redirect('/login')
  if (session.user.role !== 'admin' && session.user.role !== 'client') redirect('/login')

  // Resolve effective clientId
  let clientId: string | null = null
  if (imp) {
    clientId = imp.clientId
  } else {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { clientId: true },
    })
    clientId = user?.clientId ?? null
  }
  let unreadCount = 0
  let notifications: { id: string; title: string; message: string; read: boolean; createdAt: string }[] = []

  if (clientId) {
    const notifs = await prisma.notification.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
    unreadCount = notifs.filter((n) => !n.read).length
    notifications = notifs.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }))
  }

  // Referral popup data + project link + install banner
  let showReferralPopup = false
  let referralLink = ''
  let showProjectLink = false
  let showInstallBanner = true

  if (clientId) {
    const [client, activeSubscription] = await Promise.all([
      prisma.client.findUnique({
        where: { id: clientId },
        select: { lastReferralPromptAt: true, referralCode: true, entryFlow: true },
      }),
      prisma.subscription.findFirst({
        where: { clientId, status: 'active' },
        select: { id: true },
      }),
    ])
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    referralLink = `${appUrl}/i/${client?.referralCode ?? ''}`

    // Popup só aparece para clientes com assinatura ativa
    if (activeSubscription) {
      if (!client?.lastReferralPromptAt) {
        showReferralPopup = true
      } else {
        const hoursSince = (Date.now() - client.lastReferralPromptAt.getTime()) / (1000 * 60 * 60)
        showReferralPopup = hoursSince >= 24
      }
    }

    if (client?.entryFlow === 'proposta') {
      const activeProposal = await prisma.proposal.findFirst({
        where: {
          clientId,
          status: { in: ['paga', 'em_desenvolvimento', 'pronto_revisao'] },
        },
        select: { id: true },
      })
      showProjectLink = activeProposal !== null

      // Banner de install/notificação oculto enquanto aguarda pagamento da proposta
      if (!activeSubscription) {
        const pendingPayment = await prisma.proposal.findFirst({
          where: { clientId, status: { in: ['enviada', 'aprovada'] } },
          select: { id: true },
        })
        if (pendingPayment) showInstallBanner = false
      }
    }
  }

  let inProduction = false
  if (clientId) {
    const [inDevProposal, activeSub] = await Promise.all([
      prisma.proposal.findFirst({
        where: {
          clientId,
          status: { in: ['aguardando_info', 'em_desenvolvimento', 'pronto_revisao'] },
          siteApprovedAt: null,
        },
        select: { id: true },
      }),
      prisma.subscription.findFirst({
        where: { clientId, status: 'active' },
        select: { id: true },
      }),
    ])
    inProduction = !!inDevProposal && !activeSub
  }

  return (
    <div className={`flex min-h-screen bg-gray-50${imp ? ' pt-10' : ''}`}>
      {/* Impersonation banner — fixed top bar visible only during admin impersonation */}
      {imp && <ImpersonationBanner clientName={imp.clientName} />}

      {/* Desktop sidebar — hidden on mobile */}
      <PainelDesktopSidebar userName={session.user.name ?? session.user.email ?? ''} showProjectLink={showProjectLink} inProduction={inProduction} />

      {/* Right column: header + content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Mobile header — compact, only visible on small screens */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-brand-dark px-4 py-3 md:hidden shadow-sm">
          <Image src="/logo.png" alt="TOP SITE" width={120} height={36} className="h-7 w-auto" priority />
          {!inProduction && (
            <NotificationBell
              unreadCount={unreadCount}
              notifications={notifications}
              onMarkRead={markNotificationRead}
              onMarkAll={markAllNotificationsRead}
              allHref="/painel/notificacoes"
            />
          )}
        </header>

        {/* Desktop header — notification bell + user name, hidden on mobile */}
        <header className="sticky top-0 z-30 hidden md:flex items-center justify-end gap-3 bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
          {!inProduction && (
            <NotificationBell
              unreadCount={unreadCount}
              notifications={notifications}
              onMarkRead={markNotificationRead}
              onMarkAll={markAllNotificationsRead}
              allHref="/painel/notificacoes"
              theme="light"
            />
          )}
          <span className="text-sm text-gray-600">{session.user.name}</span>
        </header>

        {/* Page content — extra bottom padding on mobile to clear the fixed bottom nav (72px) */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          <PwaSetup />
          {children}
        </main>

        {/* Footer with legal links */}
        <footer className="hidden md:flex items-center justify-center gap-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          <a href="/termos/hospedagem" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 hover:underline">
            Termos de Uso
          </a>
          <span>·</span>
          <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 hover:underline">
            Privacidade
          </a>
        </footer>
      </div>

      {/* Mobile bottom navigation — hidden on desktop */}
      <PainelBottomNav showProjectLink={showProjectLink} inProduction={inProduction} />

      {/* PWA install modal */}
      <PwaInstallModal show={showInstallBanner} />

      {/* Referral popup */}
      {showReferralPopup && clientId && (
        <ReferralPopupWrapper
          referralLink={referralLink}
          whatsappNumber={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''}
          clientId={clientId}
        />
      )}
    </div>
  )
}
