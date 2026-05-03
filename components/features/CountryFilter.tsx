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
          'shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors',
          selected === null
            ? 'bg-[#002868] text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
        )}
      >
        Todas
      </button>
      {countries.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={cn(
            'shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors',
            selected === c
              ? 'bg-[#002868] text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
          )}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
