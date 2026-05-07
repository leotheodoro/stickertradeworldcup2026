// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJwt } from '@/lib/jwt'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const payload = await verifyJwt(token)

    const locationComplete = payload.locationComplete === true
    const isCompleteLocationPage = pathname.startsWith('/complete-location')

    if (!locationComplete && !isCompleteLocationPage) {
      return NextResponse.redirect(new URL('/complete-location', request.url))
    }

    if (locationComplete && isCompleteLocationPage) {
      return NextResponse.redirect(new URL('/collection', request.url))
    }

    return NextResponse.next()
  } catch {
    const res = NextResponse.redirect(new URL('/login', request.url))
    res.cookies.set('token', '', { maxAge: 0, path: '/' })
    return res
  }
}

export const config = {
  matcher: ['/collection/:path*', '/complete-location/:path*', '/match/:path*', '/trade/:path*'],
}
