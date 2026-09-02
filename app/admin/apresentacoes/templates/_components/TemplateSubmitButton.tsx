'use client'

import { useFormStatus } from 'react-dom'

export default function TemplateSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-brand text-brand-dark text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? 'Salvando...' : label}
    </button>
  )
}
