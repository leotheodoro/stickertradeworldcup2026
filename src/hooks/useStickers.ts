// hooks/useStickers.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { compareAlbumCountries } from '@/lib/sticker-album'

interface Sticker {
  id: string
  code: string
  name: string
  country: string
  section: string
  isFoil: boolean
  quantity: number | null
}

interface UseStickersParams {
  country?: string | null
  search?: string
}

const EMPTY_STICKERS: Sticker[] = []

export function useStickers({ country, search }: UseStickersParams = {}) {
  const params = new URLSearchParams()
  if (country) params.set('country', country)
  if (search) params.set('search', search)

  const { data, isLoading } = useQuery<{ stickers: Sticker[] }>({
    queryKey: ['stickers', { country: country ?? null, search: search ?? '' }],
    queryFn: () => fetch(`/api/stickers?${params}`).then((r) => r.json()),
  })

  const stickers = data?.stickers ?? EMPTY_STICKERS

  const countries = useMemo(
    () =>
      Array.from(
        new Set(stickers.filter((s) => s.section === 'country').map((s) => s.country)),
      ).sort(compareAlbumCountries),
    [stickers],
  )

  return { stickers, countries, isLoading }
}
