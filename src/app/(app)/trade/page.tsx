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
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#d9e2ff] bg-white/88 p-6 shadow-[0_20px_50px_rgba(6,35,91,0.08)] backdrop-blur sm:p-8">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top,rgba(191,10,48,0.12),transparent_54%)]" />
        <div className="relative">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#bf0a30]">
            Mercado de trocas
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-[#06235b] sm:text-5xl">
            Encontre quem tem sua próxima figurinha
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Busque a figurinha desejada, veja quem tem repetida e abra a conversa já sabendo o que
            pode entrar no negócio.
          </p>
        </div>
      </section>

      <div>
        <SearchBar
          placeholder="Buscar figurinha por nome, código ou país..."
          onSearch={handleSearch}
        />
      </div>

      {matchingStickers.length > 0 && !selectedSticker && (
        <div className="overflow-hidden rounded-[1.5rem] border border-[#d9e2ff] bg-white/92 shadow-[0_16px_40px_rgba(6,35,91,0.08)] backdrop-blur">
          {matchingStickers.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSticker(s)}
              className="flex w-full items-center gap-3 border-b border-slate-100/80 px-4 py-3 text-left transition-colors last:border-0 hover:bg-[#f6f8ff]"
            >
              <span className="w-16 shrink-0 text-lg font-semibold text-[#06235b]">{s.code}</span>
              <span className="text-sm text-slate-700">{s.name}</span>
              <span className="ml-auto rounded-full bg-[#06235b]/8 px-2.5 py-1 text-[11px] font-medium text-[#06235b]">
                {s.country}
              </span>
            </button>
          ))}
        </div>
      )}

      {selectedSticker && (
        <div>
          <div className="mb-4 flex items-center gap-3 rounded-[1.5rem] border border-[#d9e2ff] bg-white/88 p-4 shadow-[0_16px_40px_rgba(6,35,91,0.08)] backdrop-blur">
            <span className="rounded-full bg-[#06235b] px-3 py-1 text-xl font-semibold text-white">
              {selectedSticker.code}
            </span>
            <span className="text-sm font-medium text-slate-700">{selectedSticker.name}</span>
            <button
              onClick={() => setSelectedSticker(null)}
              className="ml-auto rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
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
        <p className="rounded-[1.5rem] border border-dashed border-[#cbd7f7] bg-white/70 py-12 text-center text-slate-500">
          Digite o nome ou código de uma figurinha para começar.
        </p>
      )}
    </div>
  )
}
