import { X } from 'lucide-react'
import { ReactNode } from 'react'

interface Props {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  children: ReactNode
}

export default function Dialog({ isOpen, setIsOpen, children }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 top-0 left-0 z-50">
      <div className="bg-background border border-border p-6 rounded-lg shadow-xl relative min-h-[200px] max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-2 right-2 text-foreground hover:text-gray-200"
          onClick={() => setIsOpen(false)}
          aria-label="Close dialog"
        >
          <X className="w-6 h-6" />
        </button>
        {children}
      </div>
    </div>
  )
}
