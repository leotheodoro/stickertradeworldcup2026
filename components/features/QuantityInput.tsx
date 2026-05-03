// components/features/QuantityInput.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'

interface QuantityInputProps {
  stickerId: string
  currentQuantity: number
  onSave: (stickerId: string, quantity: number) => void
  onRemove: (stickerId: string) => void
}

export function QuantityInput({ stickerId, currentQuantity, onSave, onRemove }: QuantityInputProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(currentQuantity)
  const duplicates = currentQuantity - 1

  function handleOpen() {
    setValue(currentQuantity)
    setOpen(true)
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="rounded-full bg-[#F5C518] px-2 py-0.5 text-xs font-bold text-[#002868]"
        title="Editar repetidas"
      >
        {duplicates > 0 ? `${duplicates}×` : 'Rep.'}
      </button>
      <Modal open={open} onOpenChange={setOpen} title="Quantas você tem?">
        <p className="mb-4 text-sm text-slate-600">
          Informe quantas cópias desta figurinha você tem no total.
        </p>
        <div className="mb-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setValue((v) => Math.max(1, v - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#002868] text-[#002868] text-xl font-bold hover:bg-[#002868]/10"
          >
            −
          </button>
          <span
            className="text-5xl text-[#002868]"
            style={{ fontFamily: 'var(--font-bebas, sans-serif)' }}
          >
            {value}
          </span>
          <button
            onClick={() => setValue((v) => Math.min(99, v + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#002868] text-[#002868] text-xl font-bold hover:bg-[#002868]/10"
          >
            +
          </button>
        </div>
        {value > 1 && (
          <p className="mb-4 text-center text-sm text-slate-500">
            {value - 1} repetida{value - 1 > 1 ? 's' : ''} disponível para troca
          </p>
        )}
        <div className="flex gap-2">
          <Button
            onClick={() => { onSave(stickerId, value); setOpen(false) }}
            className="flex-1"
          >
            Salvar
          </Button>
          <Button
            variant="ghost"
            onClick={() => { onRemove(stickerId); setOpen(false) }}
            className="flex-1 text-slate-500"
          >
            Não tenho
          </Button>
        </div>
      </Modal>
    </>
  )
}
