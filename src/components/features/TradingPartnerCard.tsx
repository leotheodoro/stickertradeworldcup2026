// components/features/TradingPartnerCard.tsx
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { Button } from '@/components/ui/button'

interface Sticker {
  id: string
  code: string
  name: string
}

interface TradingPartner {
  userId: string
  name: string
  phone: string
  duplicatesAvailable: number
  theyNeedFromYou: Sticker[]
}

interface TradingPartnerCardProps {
  partner: TradingPartner
  searchedSticker: Sticker
}

export function TradingPartnerCard({ partner, searchedSticker }: TradingPartnerCardProps) {
  const waUrl = buildWhatsAppUrl(partner.phone, searchedSticker)

  return (
    <div className="rounded-[1.75rem] border border-[#d9e2ff] bg-white/92 p-5 shadow-[0_18px_44px_rgba(6,35,91,0.08)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-slate-800">{partner.name}</p>
          <span className="mt-2 inline-block rounded-full bg-[#F5C518]/20 px-3 py-1 text-xs font-medium text-[#002868]">
            Tem {partner.duplicatesAvailable} repetida{partner.duplicatesAvailable > 1 ? 's' : ''}
          </span>
        </div>
        <a href={waUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary" size="sm">
            💬 Conversar no WhatsApp
          </Button>
        </a>
      </div>
      {partner.theyNeedFromYou.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Precisa de {partner.theyNeedFromYou.length} figurinha
            {partner.theyNeedFromYou.length > 1 ? 's' : ''} que você tem repetida:
          </p>
          <div className="flex flex-wrap gap-1">
            {partner.theyNeedFromYou.map((s) => (
              <span
                key={s.id}
                className="rounded-full bg-[#002868]/10 px-2.5 py-1 text-xs font-semibold text-[#002868]"
              >
                {s.code}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
