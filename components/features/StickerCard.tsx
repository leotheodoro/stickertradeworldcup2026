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
  onToggleOwned: (stickerId: string) => void
  onUpdateQuantity: (stickerId: string, quantity: number) => void
  onRemove: (stickerId: string) => void
}

export function StickerCard({ sticker, onToggleOwned, onUpdateQuantity, onRemove }: StickerCardProps) {
  const owned = sticker.quantity !== null
  const hasDuplicate = (sticker.quantity ?? 0) > 1

  return (
    <div
      className={cn(
        'relative flex flex-col items-center rounded-lg border-2 p-2 transition-all',
        owned
          ? hasDuplicate
            ? 'border-[#F5C518] bg-[#F5C518]/10'
            : 'border-[#002868] bg-[#002868]/5'
          : 'border-slate-200 bg-white opacity-60',
        sticker.isFoil && owned && 'shadow-[0_0_8px_2px_rgba(245,197,24,0.5)]',
      )}
    >
      <button
        onClick={() => !owned && onToggleOwned(sticker.id)}
        onDoubleClick={() => owned && onToggleOwned(sticker.id)}
        className="flex w-full flex-col items-center gap-1 focus:outline-none"
        title={owned ? 'Duplo clique para remover' : 'Clique para marcar como tenho'}
      >
        <span
          className={cn(
            'text-xl leading-none',
            owned ? (sticker.isFoil ? 'text-[#F5C518]' : 'text-[#002868]') : 'text-slate-400',
          )}
          style={{ fontFamily: 'var(--font-bebas, sans-serif)' }}
        >
          {sticker.code}
        </span>
        <span className="line-clamp-2 text-center text-[10px] leading-tight text-slate-500">
          {sticker.name}
        </span>
        {owned && (
          <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#002868]">
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
          />
        </div>
      )}
    </div>
  )
}
