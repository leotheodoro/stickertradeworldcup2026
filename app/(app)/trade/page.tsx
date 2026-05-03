// app/(app)/trade/page.tsx
'use client'

import { useState, useCallback } from 'react'
import { Suspense } from 'react'
import { SearchBar } from '@/components/features/SearchBar'
import { TradingPartnerCard } from '@/components/features/TradingPartnerCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useStickers } from '@/hooks/useStickers'
import { useTrade } from '@/hooks/useTrade'

function TradeResults({
  stickerId,
  sticker,
}: {
  stickerId: string
  sticker: { id: string; code: string; name: string }
}) {
  const { partners, isLoading } = useTrade(stickerId)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (partners.length === 0) {
    return (
      <p className="py-8 text-center text-slate-500">
        Nenhum usuário tem esta figurinha como repetida no momento.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {partners.map((p) => (
        <TradingPartnerCard key={p.userId} partner={p} searchedSticker={sticker} />
      ))}
    </div>
  )
}

export default function TradePage() {
  const [search, setSearch] = useState('')
  const [selectedSticker, setSelectedSticker] = useState<{
    id: string
    code: string
    name: string
  } | null>(null)

  const { stickers } = useStickers({ search })
  const matchingStickers = search.trim().length > 0 ? stickers.slice(0, 10) : []

  const handleSearch = useCallback((v: string) => {
    setSearch(v)
    setSelectedSticker(null)
  }, [])

  return (
    <div>
      <h1
        className="mb-2 text-4xl text-[#002868]"
        style={{ fontFamily: 'var(--font-bebas, sans-serif)' }}
      >
        Trocar Figurinhas
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Busque uma figurinha que você precisa e veja quem tem repetida.
      </p>

      <div className="mb-4">
        <SearchBar
          placeholder="Buscar figurinha por nome, código ou país..."
          onSearch={handleSearch}
        />
      </div>

      {matchingStickers.length > 0 && !selectedSticker && (
        <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {matchingStickers.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSticker(s)}
              className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50"
            >
              <span
                className="w-16 shrink-0 text-lg text-[#002868]"
                style={{ fontFamily: 'var(--font-bebas, sans-serif)' }}
              >
                {s.code}
              </span>
              <span className="text-sm text-slate-700">{s.name}</span>
              <span className="ml-auto text-xs text-slate-400">{s.country}</span>
            </button>
          ))}
        </div>
      )}

      {selectedSticker && (
        <div>
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-[#002868]/10 p-3">
            <span
              className="text-2xl text-[#002868]"
              style={{ fontFamily: 'var(--font-bebas, sans-serif)' }}
            >
              {selectedSticker.code}
            </span>
            <span className="text-sm font-medium text-slate-700">{selectedSticker.name}</span>
            <button
              onClick={() => setSelectedSticker(null)}
              className="ml-auto text-xs text-slate-400 hover:text-slate-600"
            >
              ✕ Mudar
            </button>
          </div>
          <Suspense
            fallback={
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            }
          >
            <TradeResults stickerId={selectedSticker.id} sticker={selectedSticker} />
          </Suspense>
        </div>
      )}

      {!selectedSticker && search.trim().length === 0 && (
        <p className="py-12 text-center text-slate-400">
          Digite o nome ou código de uma figurinha para começar.
        </p>
      )}
    </div>
  )
}
