import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rankTradeMatches } from '@/lib/trade-matches'
import { tradeMatchesQuerySchema } from '@/lib/validation/trade.schema'

export async function GET(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!user.cityIbgeCode) {
    return NextResponse.json(
      { error: 'Complete sua localização para encontrar trocas na sua cidade' },
      { status: 400 },
    )
  }

  const { searchParams } = new URL(req.url)
  const result = tradeMatchesQuerySchema.safeParse({
    limit: searchParams.get('limit') ?? undefined,
  })

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const currentUserStickers = await prisma.userSticker.findMany({
    where: { userId: user.id },
    include: { sticker: true },
  })

  const partnerStickers = await prisma.userSticker.findMany({
    where: { userId: { not: user.id }, user: { cityIbgeCode: user.cityIbgeCode } },
    include: {
      sticker: true,
      user: { select: { id: true, name: true, phone: true } },
    },
  })

  const matches = rankTradeMatches({
    currentUserStickers,
    partnerStickers,
    limit: result.data.limit,
  })

  return NextResponse.json(matches)
}
