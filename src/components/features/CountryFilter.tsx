// components/features/CountryFilter.tsx
'use client'

import { cn } from '@/lib/utils'

interface CountryFilterProps {
  countries: string[]
  selected: string | null
  onChange: (country: string | null) => void
}

function FilterButton({
  label,
  isSelected,
  onClick,
}: {
  label: string
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full border px-4 py-2.5 text-sm font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06235b]/20 focus-visible:ring-offset-2',
        isSelected
          ? 'border-[#06235b]/10 bg-[linear-gradient(135deg,#06235b_0%,#0a3c88_100%)] text-white shadow-[0_16px_34px_rgba(6,35,91,0.22)]'
          : 'border-[#d9e2ff] bg-white/88 text-slate-600 shadow-[0_10px_24px_rgba(6,35,91,0.05)] hover:border-[#bfd0ff] hover:bg-white',
      )}
    >
      {isSelected && (
        <>
          <span className="pointer-events-none absolute inset-y-1 left-2 w-1/2 rounded-full bg-white/22 blur-lg" />
          <span className="pointer-events-none absolute right-1 top-1 h-6 w-6 rounded-full bg-[#f5c518]/30 blur-md" />
        </>
      )}
      <span className="relative z-10">{label}</span>
    </button>
  )
}

export function CountryFilter({ countries, selected, onChange }: CountryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
      <FilterButton label="Todas" isSelected={selected === null} onClick={() => onChange(null)} />
      {countries.map((c) => (
        <FilterButton key={c} label={c} isSelected={selected === c} onClick={() => onChange(c)} />
      ))}
    </div>
  )
}
