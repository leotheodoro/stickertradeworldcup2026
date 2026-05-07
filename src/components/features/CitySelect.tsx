'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { IbgeCity } from '@/lib/brazil'

interface CitySelectProps {
  id: string
  label: string
  cities: IbgeCity[]
  value: { city: string; cityIbgeCode: string }
  onChange: (city: { city: string; cityIbgeCode: string }) => void
  disabled?: boolean
  loading?: boolean
  error?: string
  placeholder?: string
}

export function CitySelect({
  id,
  label,
  cities,
  value,
  onChange,
  disabled = false,
  loading = false,
  error,
  placeholder = 'Selecione a cidade',
}: CitySelectProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const filteredCities = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')
    if (!normalizedQuery) return cities.slice(0, 80)

    return cities
      .filter((city) => city.nome.toLocaleLowerCase('pt-BR').includes(normalizedQuery))
      .slice(0, 80)
  }, [cities, query])

  return (
    <div ref={containerRef} className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className={cn(
            'flex w-full items-center justify-between rounded-2xl border border-[#d6def6] bg-white/88 px-4 py-3 text-sm shadow-[0_10px_24px_rgba(6,35,91,0.04)] outline-none transition-all',
            'focus-visible:border-[#002868] focus-visible:ring-4 focus-visible:ring-[#002868]/10',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[#BF0A30] focus-visible:border-[#BF0A30] focus-visible:ring-[#BF0A30]/20',
          )}
        >
          <span
            className={cn(
              value.city ? 'text-slate-800' : disabled ? 'text-slate-400' : 'text-slate-500',
            )}
          >
            {loading ? 'Carregando cidades...' : value.city || placeholder}
          </span>
          <span className="text-slate-400">▾</span>
        </button>

        {open && !disabled && (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-[1.5rem] border border-[#d9e2ff] bg-white shadow-[0_22px_54px_rgba(6,35,91,0.14)]">
            <div className="border-b border-slate-100 p-3">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar cidade..."
                className="w-full rounded-xl border border-[#d6def6] bg-[#f8faff] px-3 py-2 text-sm outline-none transition-all focus:border-[#002868] focus:ring-4 focus:ring-[#002868]/10"
              />
            </div>

            <div className="max-h-64 overflow-y-auto p-2">
              {loading && <p className="px-3 py-2 text-sm text-slate-500">Carregando cidades...</p>}

              {!loading && filteredCities.length === 0 && (
                <p className="px-3 py-2 text-sm text-slate-500">Nenhuma cidade encontrada.</p>
              )}

              {!loading &&
                filteredCities.map((city) => {
                  const selected = value.cityIbgeCode === String(city.id)

                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => {
                        onChange({ city: city.nome, cityIbgeCode: String(city.id) })
                        setOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors',
                        selected
                          ? 'bg-[#06235b] text-white'
                          : 'text-slate-700 hover:bg-[#f6f8ff]',
                      )}
                    >
                      <span>{city.nome}</span>
                      {selected && <span className="text-xs font-semibold">✓</span>}
                    </button>
                  )
                })}
            </div>
          </div>
        )}
      </div>

      {error && <span className="text-xs text-[#BF0A30]">{error}</span>}
    </div>
  )
}
