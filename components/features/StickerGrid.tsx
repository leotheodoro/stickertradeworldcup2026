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
  const { toggleOwned, updateQuantity, removeSticker } = useCollection()

  const handleSearch = useCallback((v: string) => setSearch(v), [])

  const grouped = stickers.reduce<Record<string, typeof stickers>>(
    (acc, s) => ({ ...acc, [s.country]: [...(acc[s.country] ?? []), s] }),
    {},
  )

  if (isLoading) return null

  return (
    <div className="space-y-4">
      <SearchBar
        placeholder="Pesquisar figurinha por nome, código ou país..."
        onSearch={handleSearch}
      />
      <CountryFilter countries={countries} selected={country} onChange={setCountry} />
      {Object.entries(grouped).map(([countryName, group]) => (
        <section key={countryName}>
          <h2
            className="mb-2 text-2xl text-[#002868]"
            style={{ fontFamily: 'var(--font-bebas, sans-serif)' }}
          >
            {countryName}
          </h2>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
            {group.map((sticker) => (
              <StickerCard
                key={sticker.id}
                sticker={sticker}
                onToggleOwned={toggleOwned}
                onUpdateQuantity={updateQuantity}
                onRemove={removeSticker}
              />
            ))}
          </div>
        </section>
      ))}
      {stickers.length === 0 && (
        <p className="py-12 text-center text-slate-500">Nenhuma figurinha encontrada.</p>
      )}
    </div>
  )
}
