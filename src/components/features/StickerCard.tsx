// components/features/StickerCard.tsx
'use client'

import { cn } from '@/lib/utils'
import { QuantityInput } from './QuantityInput'

interface Sticker {
  id: string
  code: string
  name: string
  isFoil: boolean
  quantity: number | null
}

interface StickerCardProps {
  sticker: Sticker
  onToggleOwned: (stickerId: string) => Promise<void>
  onUpdateQuantity: (stickerId: string, quantity: number) => Promise<void>
  onRemove: (stickerId: string) => Promise<void>
  isPending?: boolean
  isSaving?: boolean
  isRemoving?: boolean
}

export function StickerCard({
  sticker,
  onToggleOwned,
  onUpdateQuantity,
  onRemove,
  isPending = false,
  isSaving = false,
  isRemoving = false,
}: StickerCardProps) {
  const owned = sticker.quantity !== null
  const hasDuplicate = (sticker.quantity ?? 0) > 1

  return (
    <div
      className={cn(
        'relative flex flex-col items-center overflow-hidden rounded-[1.35rem] border p-2.5 transition-all',
        'shadow-[0_12px_28px_rgba(6,35,91,0.06)] hover:-translate-y-0.5 hover:shadow-[0_20px_38px_rgba(6,35,91,0.12)]',
        owned
          ? hasDuplicate
            ? 'border-[#f5c518]/70 bg-[linear-gradient(180deg,rgba(245,197,24,0.18),rgba(255,255,255,0.92))]'
            : 'border-[#cdd8f7] bg-[linear-gradient(180deg,rgba(6,35,91,0.06),rgba(255,255,255,0.92))]'
          : 'border-[#dfe7fb] bg-white/92',
        sticker.isFoil &&
          owned &&
          'shadow-[0_0_0_1px_rgba(245,197,24,0.3),0_18px_36px_rgba(245,197,24,0.18)]',
      )}
    >
      {sticker.isFoil && (
        <div className="absolute inset-x-4 top-0 h-1 rounded-full bg-[linear-gradient(90deg,#f5c518_0%,#ffe89a_50%,#f5c518_100%)]" />
      )}
      <button
        onClick={() => {
          if (!owned) void onToggleOwned(sticker.id)
        }}
        onDoubleClick={() => {
          if (owned) void onRemove(sticker.id)
        }}
        disabled={isPending}
        className="flex w-full flex-col items-center gap-1.5 rounded-[1rem] px-1 py-1.5 focus:outline-none disabled:cursor-wait"
        title={owned ? 'Duplo clique para remover' : 'Clique para marcar como tenho'}
      >
        <span
          className={cn(
            'text-xl font-semibold leading-none',
            owned ? (sticker.isFoil ? 'text-[#F5C518]' : 'text-[#002868]') : 'text-slate-400',
          )}
        >
          {sticker.code}
        </span>
        <span className="line-clamp-2 min-h-[2rem] text-center text-[10px] leading-tight text-slate-500">
          {sticker.name}
        </span>
        {owned && (
          <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#06235b] shadow-[0_8px_18px_rgba(6,35,91,0.24)]">
            <span className="text-[10px] text-white">✓</span>
          </div>
        )}
      </button>
      {owned && (
        <div className="mt-1">
          <QuantityInput
            stickerId={sticker.id}
            currentQuantity={sticker.quantity!}
            onSave={onUpdateQuantity}
            onRemove={onRemove}
            isSaving={isSaving}
            isRemoving={isRemoving}
          />
        </div>
      )}
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[2px]">
          <div className="flex items-center gap-2 rounded-full bg-[#06235b] px-3 py-1.5 text-xs font-medium text-white shadow-[0_10px_24px_rgba(6,35,91,0.24)]">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/85 border-t-transparent" />
            {isRemoving ? 'Removendo...' : 'Salvando...'}
          </div>
        </div>
      )}
    </div>
  )
}
