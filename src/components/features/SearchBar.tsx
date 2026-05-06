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
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[1.6rem] border border-[#d9e2ff] bg-white/92 py-3.5 pl-11 pr-4 text-sm shadow-[0_16px_36px_rgba(6,35,91,0.06)] outline-none transition-all focus:border-[#06235b] focus:ring-4 focus:ring-[#06235b]/10"
      />
    </div>
  )
}
