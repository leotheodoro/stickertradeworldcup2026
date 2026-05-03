// hooks/useTrade.ts
'use client'

import { useQuery } from '@tanstack/react-query'

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

export function useTrade(stickerId: string | null) {
  const { data, isLoading } = useQuery<{ partners: TradingPartner[] }>({
    queryKey: ['trade', stickerId],
    queryFn: () =>
      fetch(`/api/trade/search?stickerId=${stickerId}`).then((r) => r.json()),
    enabled: !!stickerId,
  })

  return { partners: data?.partners ?? [], isLoading }
}
