// app/api/collection/[stickerId]/route.ts
import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateQuantitySchema } from '@/lib/validation/collection.schema'

interface Params {
  params: Promise<{ stickerId: string }>
}

export async function PUT(req: Request, { params }: Params) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { stickerId } = await params
  const body = await req.json()
  const result = updateQuantitySchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const { quantity } = result.data

  const userSticker = await prisma.userSticker.upsert({
    where: { userId_stickerId: { userId: user.id, stickerId } },
    create: { userId: user.id, stickerId, quantity },
    update: { quantity },
  })

  return NextResponse.json({ userSticker })
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { stickerId } = await params

  await prisma.userSticker.delete({
    where: { userId_stickerId: { userId: user.id, stickerId } },
  })

  return NextResponse.json({ ok: true })
}
