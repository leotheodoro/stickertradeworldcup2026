// lib/auth.ts
import { cookies } from 'next/headers'
import { verifyJwt } from './jwt'
import { prisma } from './prisma'

export async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  try {
    const payload = await verifyJwt(token)
    return await prisma.user.findUnique({
      where: { id: payload.sub as string },
      select: { id: true, name: true, email: true, phone: true },
    })
  } catch {
    return null
  }
}
