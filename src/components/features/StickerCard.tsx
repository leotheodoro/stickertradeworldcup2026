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
  isSaving?: boolean
  isRemoving?: boolean
}

export function StickerCard({
  sticker,
  onToggleOwned,
  onUpdateQuantity,
  onRemove,
  isSaving = false,
  isRemoving = false,
}: StickerCardProps) {
  const owned = sticker.quantity !== null
  const hasDuplicate = (sticker.quantity ?? 0) > 1

  async function handleToggle() {
    if (owned) {
      await onRemove(sticker.id)
      return
    }

    await onToggleOwned(sticker.id)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    void handleToggle()
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => void handleToggle()}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative flex min-h-[13.5rem] flex-col overflow-hidden rounded-[1.5rem] border p-3 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#06235b]/25 focus-visible:ring-offset-2',
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
      <div className="flex flex-1 flex-col justify-between gap-3 rounded-[1rem] px-1 py-1.5">
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-2 text-center">
          <span
            className={cn(
              'text-2xl font-semibold leading-none sm:text-xl',
              owned ? (sticker.isFoil ? 'text-[#F5C518]' : 'text-[#002868]') : 'text-slate-400',
            )}
          >
            {sticker.code}
          </span>
          <span className="line-clamp-2 min-h-[2.5rem] text-center text-xs leading-tight text-slate-500 sm:text-[11px]">
            {sticker.name}
          </span>
        </div>

        <div className="flex min-h-[1.25rem] items-center justify-center">
          {!owned && (
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 sm:text-[9px]">
              Toque para marcar
            </span>
          )}
          {owned && isSaving && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#06235b]/45 border-t-transparent" />
          )}
        </div>
      </div>
      {owned && (
        <div className="mt-2 w-full" onClick={(event) => event.stopPropagation()}>
          <QuantityInput
            stickerId={sticker.id}
            currentQuantity={sticker.quantity!}
            onSave={onUpdateQuantity}
            isSaving={isSaving}
            isRemoving={isRemoving}
          />
        </div>
      )}
    </div>
  )
}
