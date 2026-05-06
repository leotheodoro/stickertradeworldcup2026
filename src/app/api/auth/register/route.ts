// app/api/auth/register/route.ts
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signJwt } from '@/lib/jwt'
import { registerSchema } from '@/lib/validation/auth.schema'

export async function POST(req: Request) {
  const body = await req.json()
  const result = registerSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const { name, email, password, phone } = result.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)
  const created = await prisma.user.create({
    data: { name, email, password: hashed, phone },
    select: { id: true, name: true, email: true, phone: true },
  })

  // Ensure password is never sent in response (guards against mock or future schema changes)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _pw, ...user } = created as typeof created & { password?: string }

  const token = await signJwt({ sub: user.id })

  const res = NextResponse.json({ user }, { status: 201 })
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
