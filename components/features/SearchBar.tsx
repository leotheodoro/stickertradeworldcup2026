// components/features/SearchBar.tsx
'use client'

import { useEffect, useRef, useState } from 'react'

interface SearchBarProps {
  placeholder: string
  onSearch: (value: string) => void
  debounceMs?: number
}

export function SearchBar({ placeholder, onSearch, debounceMs = 300 }: SearchBarProps) {
  const [value, setValue] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSearch(value), debounceMs)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value, debounceMs, onSearch])

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#002868] focus:ring-2 focus:ring-[#002868]/20"
      />
    </div>
  )
}
