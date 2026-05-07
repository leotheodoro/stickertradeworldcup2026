import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { buildTradeMatchDetail } from '@/lib/trade-matches'
import { tradeMatchParamsSchema } from '@/lib/validation/trade.schema'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!user.cityIbgeCode) {
    return NextResponse.json(
      { error: 'Complete sua localização para ver trocas na sua cidade' },
      { status: 400 },
    )
  }

  const result = tradeMatchParamsSchema.safeParse(await params)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const partner = await prisma.user.findUnique({
    where: { id: result.data.userId },
    select: { id: true, name: true, phone: true, cityIbgeCode: true },
  } as never)

  if (!partner || partner.id === user.id || partner.cityIbgeCode !== user.cityIbgeCode) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  const [currentUserStickers, partnerStickers] = await Promise.all([
    prisma.userSticker.findMany({
      where: { userId: user.id },
      include: { sticker: true },
    }),
    prisma.userSticker.findMany({
      where: { userId: partner.id },
      include: { sticker: true },
    }),
  ])

  const match = buildTradeMatchDetail({
    currentUserStickers,
    partnerStickers,
    partner,
  })

  return NextResponse.json({ match })
}
