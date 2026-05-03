'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
}

export function Modal({ open, onOpenChange, title, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (open) ref.current?.showModal()
    else ref.current?.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={() => onOpenChange(false)}
      className={cn(
        'rounded-xl bg-white p-6 shadow-xl w-full max-w-md',
        'backdrop:bg-black/50 backdrop:backdrop-blur-sm',
      )}
    >
      <h2 className="mb-4 text-2xl font-bold text-[#002868]" style={{ fontFamily: 'var(--font-bebas, sans-serif)' }}>{title}</h2>
      {children}
    </dialog>
  )
}
