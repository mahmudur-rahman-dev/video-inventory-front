import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userRole = request.cookies.get('userRole')?.value

  if (!userRole && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (userRole === 'admin' && !request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  if (userRole === 'user' && !request.nextUrl.pathname.startsWith('/user')) {
    return NextResponse.redirect(new URL('/user', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|videos).*)'],
}