'use client'

import { useFormStatus } from 'react-dom'

export default function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-brand text-brand-dark text-sm font-semibold px-5 py-2 rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? 'Criando...' : 'Criar e gerar link'}
    </button>
  )
}
