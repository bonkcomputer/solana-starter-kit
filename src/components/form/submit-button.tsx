'use client'

import { useFormStatus } from 'react-dom'

interface Props {
  children: React.ReactNode
  disabled?: boolean
}

export function SubmitButton({ children, disabled }: Props) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      className="bg-foreground text-background h-10 p-2 hover:opacity-80 rounded-sm disabled:opacity-50"
      disabled={pending || disabled}
    >
      {children}
    </button>
  )
}
