'use client'

import { useTransition } from 'react'
import { cancelPresentation } from '../../actions'

export default function CancelButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Cancelar esta apresentação? O link do lead deixará de funcionar.')) return
    startTransition(() => cancelPresentation(id))
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
    >
      {pending ? 'Cancelando...' : 'Cancelar apresentação'}
    </button>
  )
}
