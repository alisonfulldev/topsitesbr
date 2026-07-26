'use client'

import { useEffect, useState } from 'react'
import { ReferralPopup } from './ReferralPopup'
import { updateLastReferralPromptAt } from '@/app/painel/actions'

const SNOOZE_KEY = 'referral_snooze_until'

export function ReferralPopupWrapper({
  referralLink,
  whatsappNumber,
  clientId,
}: {
  referralLink: string
  whatsappNumber: string
  clientId: string
}) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check client-side snooze cookie
    const snoozedUntil = localStorage.getItem(SNOOZE_KEY)
    if (snoozedUntil && Date.now() < Number(snoozedUntil)) {
      return // Still snoozed
    }
    setShow(true)
  }, [])

  if (!show) return null

  async function handleDismiss(snooze: boolean) {
    setShow(false)
    if (snooze) {
      localStorage.setItem(SNOOZE_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000))
    }
    await updateLastReferralPromptAt(snooze)
  }

  return (
    <ReferralPopup
      referralLink={referralLink}
      whatsappNumber={whatsappNumber}
      onDismiss={handleDismiss}
    />
  )
}
