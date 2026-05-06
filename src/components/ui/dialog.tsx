'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  className?: string
}

export function Modal({ open, onOpenChange, title, children, className }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (open) ref.current?.showModal()
    else ref.current?.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={() => onOpenChange(false)}
      onCancel={() => onOpenChange(false)}
      className={cn(
        'w-full max-w-md rounded-[2rem] border border-[#d9e2ff] bg-white p-6 shadow-[0_28px_72px_rgba(4,20,55,0.22)]',
        'backdrop:bg-black/50 backdrop:backdrop-blur-sm',
        className,
      )}
    >
      <h2 className="mb-4 text-2xl font-bold text-[#002868]">{title}</h2>
      {children}
    </dialog>
  )
}
