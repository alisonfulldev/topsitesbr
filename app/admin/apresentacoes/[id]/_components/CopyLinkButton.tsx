'use client'

import { useState } from 'react'

export default function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 text-xs px-3 py-2 rounded border border-brand/40 text-brand hover:bg-brand/5 transition-colors"
    >
      {copied ? 'Copiado!' : 'Copiar'}
    </button>
  )
}
