// app/api/stickers/route.ts
import { NextResponse } from 'next/server'
import { StickerSection } from '@prisma/client'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { compareAlbumStickers } from '@/lib/sticker-album'

export async function GET(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const country = searchParams.get('country')
  const search = searchParams.get('search')
  const section = searchParams.get('section')

  const stickers = await prisma.sticker.findMany({
    where: {
      ...(country ? { country } : {}),
      ...(section ? { section: section as StickerSection } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
              { country: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      users: {
        where: { userId: user.id },
        select: { quantity: true },
      },
    },
  })

  const result = stickers.sort(compareAlbumStickers).map(({ users, ...s }) => ({
    ...s,
    quantity: users[0]?.quantity ?? null,
  }))

  return NextResponse.json({ stickers: result })
}
