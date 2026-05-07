import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { signJwt } from '@/lib/jwt'
import { hasCompleteLocation } from '@/lib/location'
import { prisma } from '@/lib/prisma'
import { locationSchema } from '@/lib/validation/auth.schema'

export async function PUT(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const result = locationSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: result.data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      uf: true,
      city: true,
      cityIbgeCode: true,
    },
  } as never)

  const token = await signJwt({
    sub: updatedUser.id,
    locationComplete: hasCompleteLocation(updatedUser as typeof updatedUser & {
      uf?: string | null
      city?: string | null
      cityIbgeCode?: string | null
    }),
  })

  const res = NextResponse.json({ user: updatedUser })
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
