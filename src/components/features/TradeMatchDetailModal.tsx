'use client'

import type { TradeMatchDetail } from '@/lib/trade-matches'
import { buildTradeMatchWhatsAppUrl } from '@/lib/whatsapp'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'

interface TradeMatchDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  match: TradeMatchDetail | null
  isLoading: boolean
}

function StickerGroup({
  title,
  stickers,
  tone,
}: {
  title: string
  stickers: TradeMatchDetail['theyCanGiveYou']
  tone: 'gold' | 'blue'
}) {
  if (stickers.length === 0) return null

  const toneClassName =
    tone === 'gold'
      ? 'border-[#f5c518]/40 bg-[#fff8d6] text-[#7a5a00]'
      : 'border-[#d9e2ff] bg-[#f6f8ff] text-[#06235b]'

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {stickers.map((sticker) => (
          <span
            key={sticker.id}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClassName}`}
          >
            {sticker.code} · {sticker.name}
          </span>
        ))}
      </div>
    </div>
  )
}

export function TradeMatchDetailModal({
  open,
  onOpenChange,
  match,
  isLoading,
}: TradeMatchDetailModalProps) {
  const whatsappUrl =
    match === null
      ? null
      : buildTradeMatchWhatsAppUrl({
          phone: match.phone,
          partnerName: match.name,
          theyCanGiveYou: match.theyCanGiveYou,
          youCanGiveThem: match.youCanGiveThem,
        })

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={match ? `Troca com ${match.name}` : 'Detalhes da troca'}
      className="max-w-3xl"
    >
      {isLoading && (
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-[1.5rem] bg-slate-100" />
          <div className="h-24 animate-pulse rounded-[1.5rem] bg-slate-100" />
        </div>
      )}

      {!isLoading && match && (
        <div className="space-y-6">
          <div className="rounded-[1.5rem] border border-[#d9e2ff] bg-[#f6f8ff] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#bf0a30]/10 px-3 py-1 text-sm font-semibold text-[#bf0a30]">
                {match.successRate}% de compatibilidade
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                Voce pode pegar {match.theyCanGiveYouCount}
              </span>
              <span className="rounded-full bg-[#06235b]/8 px-3 py-1 text-sm font-semibold text-[#06235b]">
                Voce pode oferecer {match.youCanGiveThemCount}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {match.isMutualMatch
                ? `Hoje voces conseguem fechar ${match.regularPairs + match.foilPairs} troca${match.regularPairs + match.foilPairs > 1 ? 's' : ''} que ja encaixam.`
                : 'Ele pode te ajudar com figurinhas faltantes, mesmo sem um encaixe completo agora.'}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-[1.5rem] border border-[#d9e2ff] bg-white p-4">
              <h3 className="text-lg font-semibold text-[#06235b]">Ele pode te passar</h3>
              <div className="mt-4 space-y-4">
                <StickerGroup title="Foil" stickers={match.theyCanGiveYouFoil} tone="gold" />
                <StickerGroup
                  title="Normais"
                  stickers={match.theyCanGiveYouRegular}
                  tone="blue"
                />
                {match.theyCanGiveYou.length === 0 && (
                  <p className="text-sm text-slate-500">Nenhuma figurinha util para voce agora.</p>
                )}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-[#d9e2ff] bg-white p-4">
              <h3 className="text-lg font-semibold text-[#06235b]">Voce pode passar</h3>
              <div className="mt-4 space-y-4">
                <StickerGroup title="Foil" stickers={match.youCanGiveThemFoil} tone="gold" />
                <StickerGroup
                  title="Normais"
                  stickers={match.youCanGiveThemRegular}
                  tone="blue"
                />
                {match.youCanGiveThem.length === 0 && (
                  <p className="text-sm text-slate-500">No momento voce nao tem repetidas que ajudem esse usuario.</p>
                )}
              </div>
            </section>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>

            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary">Conversar no WhatsApp</Button>
              </a>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
