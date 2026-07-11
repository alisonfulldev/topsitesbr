'use client'

import { useEffect } from 'react'

export function RedirectScreen({ waUrl }: { waUrl: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = waUrl
    }, 1000)
    return () => clearTimeout(timer)
  }, [waUrl])

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50">
      <div className="text-center space-y-4">
        <p className="text-2xl font-bold uppercase tracking-widest text-brand">TOP SITE</p>
        <p className="text-sm text-gray-600">Te levando para o WhatsApp...</p>
        <div className="flex justify-center pt-1">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      </div>
    </div>
  )
}
