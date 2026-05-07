interface QuantityInputProps {
  stickerId: string
  currentQuantity: number
  onSave: (stickerId: string, quantity: number) => Promise<void>
  isRemoving?: boolean
}

export function QuantityInput({
  stickerId,
  currentQuantity,
  onSave,
  isRemoving = false,
}: QuantityInputProps) {
  const duplicates = Math.max(0, currentQuantity - 1)
  const isBusy = isRemoving

  return (
    <div className="rounded-[1.1rem] border border-[#d9e2ff] bg-white/92 px-3 py-2.5 shadow-[0_10px_24px_rgba(6,35,91,0.05)] md:px-3.5 md:py-3">
      <div className="mb-2 flex items-center justify-center gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#06235b]/65">
          Reps
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center justify-center gap-2 md:grid-cols-[2.75rem_auto_2.75rem] md:gap-2.5">
        <button
          type="button"
          disabled={isBusy || duplicates === 0}
          onClick={(event) => {
            event.stopPropagation()
            void onSave(stickerId, Math.max(1, currentQuantity - 1))
          }}
          className="flex h-10 w-full items-center justify-center rounded-full border border-[#d4ddf7] bg-[#f7f9ff] text-lg font-bold text-[#06235b] transition-colors hover:bg-[#eef3ff] disabled:cursor-not-allowed disabled:opacity-35 md:h-11 md:w-11 md:text-xl"
          aria-label="Diminuir repetidas"
        >
          -
        </button>
        <span className="min-w-7 text-center text-base font-semibold text-[#06235b] md:min-w-12 md:rounded-full md:bg-[#06235b]/8 md:px-3 md:py-1.5 md:text-base">
          {duplicates}
        </span>
        <button
          type="button"
          disabled={isBusy || currentQuantity >= 99}
          onClick={(event) => {
            event.stopPropagation()
            void onSave(stickerId, currentQuantity + 1)
          }}
          className="flex h-10 w-full items-center justify-center rounded-full border border-[#d4ddf7] bg-[#f7f9ff] text-lg font-bold text-[#06235b] transition-colors hover:bg-[#eef3ff] disabled:cursor-not-allowed disabled:opacity-35 md:h-11 md:w-11 md:text-xl"
          aria-label="Aumentar repetidas"
        >
          +
        </button>
      </div>
    </div>
  )
}
