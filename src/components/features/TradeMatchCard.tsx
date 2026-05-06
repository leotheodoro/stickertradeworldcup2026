'use client'

import type { TradeMatchSummary } from '@/lib/trade-matches'

interface TradeMatchCardProps {
  match: TradeMatchSummary
  onOpenDetails: (match: TradeMatchSummary) => void
}

function PreviewList({ title, stickers }: { title: string; stickers: TradeMatchSummary['previewTheyCanGiveYou'] }) {
  if (stickers.length === 0) return null

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {stickers.map((sticker) => (
          <span
            key={sticker.id}
            className="rounded-full bg-[#06235b]/8 px-2.5 py-1 text-xs font-semibold text-[#06235b]"
          >
            {sticker.code}
            {sticker.isFoil ? ' Foil' : ''}
          </span>
        ))}
      </div>
    </div>
  )
}

export function TradeMatchCard({ match, onOpenDetails }: TradeMatchCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpenDetails(match)}
      className="w-full rounded-[1.75rem] border border-[#d9e2ff] bg-white/92 p-5 text-left shadow-[0_18px_44px_rgba(6,35,91,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(6,35,91,0.14)]"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold text-slate-800">{match.name}</p>
            <span className="rounded-full bg-[#bf0a30]/10 px-3 py-1 text-xs font-semibold text-[#bf0a30]">
              {match.successRate}% de compatibilidade
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
              Voce pode pegar {match.theyCanGiveYouCount}
            </span>
            <span className="rounded-full bg-[#06235b]/8 px-3 py-1 text-[#06235b]">
              Voce pode oferecer {match.youCanGiveThemCount}
            </span>
            {match.isMutualMatch && (
              <span className="rounded-full bg-[#F5C518]/20 px-3 py-1 text-[#7a5a00]">
                {match.regularPairs + match.foilPairs} trocas encaixam agora
              </span>
            )}
            {match.foilPairs > 0 && (
              <span className="rounded-full bg-[#F5C518]/28 px-3 py-1 text-[#7a5a00]">
                {match.foilPairs} foil compativel
              </span>
            )}
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#d9e2ff] px-4 py-2 text-sm font-semibold text-[#06235b]">
          Ver detalhes
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <PreviewList title="Ele pode te passar" stickers={match.previewTheyCanGiveYou} />
        <PreviewList title="Voce pode passar" stickers={match.previewYouCanGiveThem} />
      </div>
    </button>
  )
}
