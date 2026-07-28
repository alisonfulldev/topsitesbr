'use client'

import { useEffect } from 'react'
import { checkVisitMilestone } from '@/app/painel/actions'

const VISIT_CHECK_KEY = 'visit_milestone_ts'
const SIX_HOURS_MS = 6 * 60 * 60 * 1000

export function PwaSetup() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }

    // Check visit milestones at most once every 6 hours per browser session
    const last = localStorage.getItem(VISIT_CHECK_KEY)
    if (!last || Date.now() - parseInt(last) > SIX_HOURS_MS) {
      localStorage.setItem(VISIT_CHECK_KEY, String(Date.now()))
      checkVisitMilestone().catch(() => {})
    }
  }, [])
  return null
}
