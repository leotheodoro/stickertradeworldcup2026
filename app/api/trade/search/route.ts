// app/api/trade/search/route.ts
import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { tradeSearchSchema } from '@/lib/validation/trade.schema'

export async function GET(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const result = tradeSearchSchema.safeParse({ stickerId: searchParams.get('stickerId') })
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const { stickerId } = result.data

  // Users who have this sticker as duplicate (quantity >= 2), excluding current user
  const duplicateOwners = await prisma.userSticker.findMany({
    where: {
      stickerId,
      quantity: { gte: 2 },
      userId: { not: user.id },
    },
    include: {
      user: { select: { id: true, name: true, phone: true, email: true } },
    },
  })

  if (duplicateOwners.length === 0) {
    return NextResponse.json({ partners: [] })
  }

  // My stickers with duplicates (quantity >= 2)
  const myDuplicates = await prisma.userSticker.findMany({
    where: { userId: user.id, quantity: { gte: 2 } },
    include: { sticker: true },
  })

  const partnerIds = duplicateOwners.map((o) => o.userId)

  // For each partner: stickers they already have (to find what they need)
  const partnersCollection = await prisma.userSticker.findMany({
    where: { userId: { in: partnerIds } },
    select: { userId: true, stickerId: true },
  })

  const partnerHasSet = new Map<string, Set<string>>()
  for (const p of partnersCollection) {
    if (!partnerHasSet.has(p.userId)) partnerHasSet.set(p.userId, new Set())
    partnerHasSet.get(p.userId)!.add(p.stickerId)
  }

  const partners = duplicateOwners.map((owner) => {
    const theyHave = partnerHasSet.get(owner.userId) ?? new Set()
    const theyNeedFromYou = myDuplicates
      .filter((d) => !theyHave.has(d.stickerId))
      .map((d) => d.sticker)
      .slice(0, 5)

    return {
      userId: owner.user.id,
      name: owner.user.name,
      phone: owner.user.phone,
      duplicatesAvailable: owner.quantity - 1,
      theyNeedFromYou,
    }
  })

  return NextResponse.json({ partners })
}
