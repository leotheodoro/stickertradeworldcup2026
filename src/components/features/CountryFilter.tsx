// components/features/CountryFilter.tsx
'use client'

import { cn } from '@/lib/utils'

interface CountryFilterProps {
  countries: string[]
  selected: string | null
  onChange: (country: string | null) => void
}

export function CountryFilter({ countries, selected, onChange }: CountryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
      <button
        onClick={() => onChange(null)}
        className={cn(
          'shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition-all',
          selected === null
            ? 'border-[#06235b] bg-[#06235b] text-white shadow-[0_12px_28px_rgba(6,35,91,0.2)]'
            : 'border-[#d9e2ff] bg-white/88 text-slate-600 hover:border-[#bfd0ff] hover:bg-white',
        )}
      >
        Todas
      </button>
      {countries.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={cn(
            'shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition-all',
            selected === c
              ? 'border-[#06235b] bg-[#06235b] text-white shadow-[0_12px_28px_rgba(6,35,91,0.2)]'
              : 'border-[#d9e2ff] bg-white/88 text-slate-600 hover:border-[#bfd0ff] hover:bg-white',
          )}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
