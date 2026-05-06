// components/features/QuantityInput.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'

interface QuantityInputProps {
  stickerId: string
  currentQuantity: number
  onSave: (stickerId: string, quantity: number) => Promise<void>
  onRemove: (stickerId: string) => Promise<void>
  isSaving?: boolean
  isRemoving?: boolean
}

export function QuantityInput({
  stickerId,
  currentQuantity,
  onSave,
  onRemove,
  isSaving = false,
  isRemoving = false,
}: QuantityInputProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(currentQuantity)
  const duplicates = currentQuantity - 1
  const isBusy = isSaving || isRemoving

  function handleOpen() {
    setValue(currentQuantity)
    setOpen(true)
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="rounded-full bg-[#f5c518] px-2.5 py-1 text-xs font-bold text-[#06235b] shadow-[0_10px_24px_rgba(245,197,24,0.28)]"
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
            disabled={isBusy}
            onClick={() => setValue((v) => Math.max(1, v - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#002868] text-[#002868] text-xl font-bold hover:bg-[#002868]/10 disabled:opacity-40"
          >
            −
          </button>
          <span className="text-5xl font-semibold text-[#002868]">{value}</span>
          <button
            disabled={isBusy}
            onClick={() => setValue((v) => Math.min(99, v + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#002868] text-[#002868] text-xl font-bold hover:bg-[#002868]/10 disabled:opacity-40"
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
            loading={isSaving}
            loadingText="Salvando..."
            onClick={async () => {
              await onSave(stickerId, value)
              setOpen(false)
            }}
            disabled={isBusy}
            className="flex-1"
          >
            Salvar
          </Button>
          <Button
            variant="ghost"
            loading={isRemoving}
            loadingText="Removendo..."
            onClick={async () => {
              await onRemove(stickerId)
              setOpen(false)
            }}
            disabled={isBusy}
            className="flex-1 text-slate-500"
          >
            Não tenho
          </Button>
        </div>
      </Modal>
    </>
  )
}
