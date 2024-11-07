import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_CONSTANTS } from '@/lib/auth-constants'

const PUBLIC_PATHS = [
  '/login',
]

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  const authToken = request.cookies.get(AUTH_CONSTANTS.COOKIE_NAMES.ACCESS_TOKEN)
  const userData = request.cookies.get(AUTH_CONSTANTS.COOKIE_NAMES.USER_DATA)

  if (process.env.NODE_ENV === 'development') {
    console.log('Auth token:', authToken?.value)
    console.log('User data:', userData?.value)
  }

  if (!authToken || !userData) {
    console.log('No auth tokens found, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const user = JSON.parse(userData.value)
    const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
    const isUserPath = request.nextUrl.pathname.startsWith('/user')

    if (isAdminPath && !user.roles.includes(AUTH_CONSTANTS.ROLES.ADMIN)) {
      console.log('Unauthorized admin access attempt')
      return NextResponse.redirect(new URL('/user', request.url))
    }

    if (isUserPath && !user.roles.includes(AUTH_CONSTANTS.ROLES.USER)) {
      console.log('Unauthorized user access attempt')
      return NextResponse.redirect(new URL('/admin', request.url))
    }

  } catch (error) {
    console.error('Error in middleware:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|videos|api).*)',
  ],
}