'use client'

import { useState } from 'react'

export function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 hover:border-gray-300
                 rounded px-2 py-1 transition-colors whitespace-nowrap"
    >
      {copied ? '✓ Copiado' : 'Copiar link'}
    </button>
  )
}
