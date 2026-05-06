import { compareAlbumStickers } from '@/lib/sticker-album'

type StickerRecord = {
  id: string
  code: string
  name: string
  country: string
  section: string
  order: number
  isFoil: boolean
}

type UserRecord = {
  id: string
  name: string
  phone: string
}

export type OwnedStickerRecord = {
  userId: string
  quantity: number
  sticker: StickerRecord
  user?: UserRecord
}

export type TradeSticker = StickerRecord

export interface TradeMatchSummary {
  userId: string
  name: string
  phone: string
  score: number
  successRate: number
  isMutualMatch: boolean
  theyCanGiveYouCount: number
  youCanGiveThemCount: number
  regularPairs: number
  foilPairs: number
  previewTheyCanGiveYou: TradeSticker[]
  previewYouCanGiveThem: TradeSticker[]
}

export interface TradeMatchDetail extends TradeMatchSummary {
  theyCanGiveYou: TradeSticker[]
  youCanGiveThem: TradeSticker[]
  theyCanGiveYouFoil: TradeSticker[]
  theyCanGiveYouRegular: TradeSticker[]
  youCanGiveThemFoil: TradeSticker[]
  youCanGiveThemRegular: TradeSticker[]
}

export interface RankedTradeMatches {
  bestMatches: TradeMatchSummary[]
  canHelpYou: TradeMatchSummary[]
}

function sortTradeStickers(stickers: TradeSticker[]) {
  return stickers.toSorted(compareAlbumStickers)
}

function splitFoil(stickers: TradeSticker[]) {
  return {
    foil: stickers.filter((sticker) => sticker.isFoil),
    regular: stickers.filter((sticker) => !sticker.isFoil),
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function calculateSuccessRate({
  theyCanGiveYouRegularCount,
  theyCanGiveYouFoilCount,
  youCanGiveThemRegularCount,
  youCanGiveThemFoilCount,
  regularPairs,
  foilPairs,
}: {
  theyCanGiveYouRegularCount: number
  theyCanGiveYouFoilCount: number
  youCanGiveThemRegularCount: number
  youCanGiveThemFoilCount: number
  regularPairs: number
  foilPairs: number
}) {
  const foilWeight = 1.35
  const pairWeight = 1.45
  const theyCanGiveValue = theyCanGiveYouRegularCount + theyCanGiveYouFoilCount * foilWeight
  const youCanGiveValue = youCanGiveThemRegularCount + youCanGiveThemFoilCount * foilWeight
  const pairValue = regularPairs + foilPairs * pairWeight

  if (pairValue > 0) {
    const balance = pairValue / Math.max(theyCanGiveValue, youCanGiveValue, 1)
    const volume = Math.min((theyCanGiveValue + youCanGiveValue) / 10, 1)

    return clamp(Math.round(45 + balance * 35 + volume * 18 + foilPairs * 2), 48, 99)
  }

  if (theyCanGiveValue > 0) {
    return clamp(Math.round(22 + Math.min(theyCanGiveValue / 8, 1) * 28), 22, 50)
  }

  return 0
}

function compareTradeMatches(a: TradeMatchSummary, b: TradeMatchSummary) {
  if (b.score !== a.score) return b.score - a.score
  if (b.successRate !== a.successRate) return b.successRate - a.successRate

  const bPairs = b.regularPairs + b.foilPairs
  const aPairs = a.regularPairs + a.foilPairs
  if (bPairs !== aPairs) return bPairs - aPairs

  if (b.theyCanGiveYouCount !== a.theyCanGiveYouCount) {
    return b.theyCanGiveYouCount - a.theyCanGiveYouCount
  }

  return a.name.localeCompare(b.name, 'pt-BR')
}

export function buildTradeMatchDetail({
  currentUserStickers,
  partnerStickers,
  partner,
}: {
  currentUserStickers: OwnedStickerRecord[]
  partnerStickers: OwnedStickerRecord[]
  partner: UserRecord
}): TradeMatchDetail {
  const myOwnedStickerIds = new Set(currentUserStickers.map((entry) => entry.sticker.id))
  const partnerOwnedStickerIds = new Set(partnerStickers.map((entry) => entry.sticker.id))

  const myTradable = sortTradeStickers(
    currentUserStickers.filter((entry) => entry.quantity >= 2).map((entry) => entry.sticker),
  )
  const partnerTradable = sortTradeStickers(
    partnerStickers.filter((entry) => entry.quantity >= 2).map((entry) => entry.sticker),
  )

  const theyCanGiveYou = partnerTradable.filter((sticker) => !myOwnedStickerIds.has(sticker.id))
  const youCanGiveThem = myTradable.filter((sticker) => !partnerOwnedStickerIds.has(sticker.id))

  const theyCanGiveYouSplit = splitFoil(theyCanGiveYou)
  const youCanGiveThemSplit = splitFoil(youCanGiveThem)

  const regularPairs = Math.min(
    theyCanGiveYouSplit.regular.length,
    youCanGiveThemSplit.regular.length,
  )
  const foilPairs = Math.min(theyCanGiveYouSplit.foil.length, youCanGiveThemSplit.foil.length)
  const theyCanGiveYouCount = theyCanGiveYou.length
  const youCanGiveThemCount = youCanGiveThem.length

  const score =
    regularPairs * 12 +
    foilPairs * 18 +
    theyCanGiveYouSplit.regular.length * 4 +
    theyCanGiveYouSplit.foil.length * 6 +
    youCanGiveThemSplit.regular.length * 3 +
    youCanGiveThemSplit.foil.length * 5

  const successRate = calculateSuccessRate({
    theyCanGiveYouRegularCount: theyCanGiveYouSplit.regular.length,
    theyCanGiveYouFoilCount: theyCanGiveYouSplit.foil.length,
    youCanGiveThemRegularCount: youCanGiveThemSplit.regular.length,
    youCanGiveThemFoilCount: youCanGiveThemSplit.foil.length,
    regularPairs,
    foilPairs,
  })

  return {
    userId: partner.id,
    name: partner.name,
    phone: partner.phone,
    score,
    successRate,
    isMutualMatch: regularPairs + foilPairs > 0,
    theyCanGiveYouCount,
    youCanGiveThemCount,
    regularPairs,
    foilPairs,
    previewTheyCanGiveYou: theyCanGiveYou.slice(0, 5),
    previewYouCanGiveThem: youCanGiveThem.slice(0, 5),
    theyCanGiveYou,
    youCanGiveThem,
    theyCanGiveYouFoil: theyCanGiveYouSplit.foil,
    theyCanGiveYouRegular: theyCanGiveYouSplit.regular,
    youCanGiveThemFoil: youCanGiveThemSplit.foil,
    youCanGiveThemRegular: youCanGiveThemSplit.regular,
  }
}

export function rankTradeMatches({
  currentUserStickers,
  partnerStickers,
  limit,
}: {
  currentUserStickers: OwnedStickerRecord[]
  partnerStickers: OwnedStickerRecord[]
  limit: number
}): RankedTradeMatches {
  const partnersByUserId = new Map<string, { partner: UserRecord; stickers: OwnedStickerRecord[] }>()

  for (const entry of partnerStickers) {
    if (!entry.user) continue

    const existing = partnersByUserId.get(entry.userId)
    if (existing) {
      existing.stickers.push(entry)
      continue
    }

    partnersByUserId.set(entry.userId, {
      partner: entry.user,
      stickers: [entry],
    })
  }

  const bestMatches: TradeMatchSummary[] = []
  const canHelpYou: TradeMatchSummary[] = []

  for (const { partner, stickers } of partnersByUserId.values()) {
    const match = buildTradeMatchDetail({
      currentUserStickers,
      partnerStickers: stickers,
      partner,
    })

    if (match.isMutualMatch) {
      bestMatches.push(match)
      continue
    }

    if (match.theyCanGiveYouCount > 0) {
      canHelpYou.push(match)
    }
  }

  return {
    bestMatches: bestMatches.toSorted(compareTradeMatches).slice(0, limit),
    canHelpYou: canHelpYou.toSorted(compareTradeMatches).slice(0, limit),
  }
}
