// components/features/StickerGrid.tsx
'use client'

import { useCallback, useState } from 'react'
import { useStickers } from '@/hooks/useStickers'
import { useCollection } from '@/hooks/useCollection'
import { StickerCard } from './StickerCard'
import { CountryFilter } from './CountryFilter'
import { SearchBar } from './SearchBar'

export function StickerGrid() {
  const [country, setCountry] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const { stickers, isLoading } = useStickers({ country, search })
  // unfiltered query for the persistent filter chips (React Query caches this)
  const { countries } = useStickers()
  const { toggleOwned, updateQuantity, removeSticker, isRemovingSticker } = useCollection()

  const handleSearch = useCallback((v: string) => setSearch(v), [])

  const grouped = stickers.reduce<Record<string, typeof stickers>>(
    (acc, s) => ({ ...acc, [s.country]: [...(acc[s.country] ?? []), s] }),
    {},
  )

  if (isLoading) return null

  return (
    <div className="space-y-6">
      <SearchBar
        placeholder="Pesquisar figurinha por nome, código ou país..."
        onSearch={handleSearch}
      />
      <CountryFilter countries={countries} selected={country} onChange={setCountry} />
      {Object.entries(grouped).map(([countryName, group]) => (
        <section
          key={countryName}
          className="rounded-[2rem] border border-[#d9e2ff] bg-white/88 p-4 shadow-[0_18px_44px_rgba(6,35,91,0.06)] backdrop-blur sm:p-5"
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#bf0a30]">Seleção</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#06235b]">{countryName}</h2>
            </div>
            <span className="rounded-full bg-[#06235b]/8 px-3 py-1 text-xs font-medium text-[#06235b]">
              {group.length} figurinhas
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))]">
            {group.map((sticker) => (
              <StickerCard
                key={sticker.id}
                sticker={sticker}
                onToggleOwned={toggleOwned}
                onUpdateQuantity={updateQuantity}
                onRemove={removeSticker}
                isRemoving={isRemovingSticker(sticker.id)}
              />
            ))}
          </div>
        </section>
      ))}
      {stickers.length === 0 && (
        <p className="rounded-[1.5rem] border border-dashed border-[#cbd7f7] bg-white/70 py-12 text-center text-slate-500">
          Nenhuma figurinha encontrada.
        </p>
      )}
    </div>
  )
}
