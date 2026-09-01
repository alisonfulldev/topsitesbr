'use client'

import { useTransition } from 'react'
import { deletePresentation } from '../../actions'

export default function DeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Excluir esta apresentação permanentemente? Esta ação não pode ser desfeita.')) return
    startTransition(() => deletePresentation(id))
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
    >
      {pending ? 'Excluindo...' : 'Excluir'}
    </button>
  )
}
