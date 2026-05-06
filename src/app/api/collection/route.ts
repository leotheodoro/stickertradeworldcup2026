// app/api/collection/route.ts
import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const userStickers = await prisma.userSticker.findMany({
    where: { userId: user.id },
    include: { sticker: true },
  })

  return NextResponse.json({ userStickers })
}
