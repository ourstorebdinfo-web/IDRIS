import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req) {
  const { pathname } = req.nextUrl

  // Allow public static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next()
  }

  // Protect /admin and /api/admin routes — require ADMIN role
  const isAdminPage = pathname.startsWith('/admin')
  const isAdminApi = pathname.startsWith('/api/admin')

  if (isAdminPage || isAdminApi) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
      // Not logged in — redirect to signin
      const signinUrl = new URL('/auth/signin', req.url)
      signinUrl.searchParams.set('callbackUrl', req.url)
      return NextResponse.redirect(signinUrl)
    }

    if (token.role !== 'ADMIN') {
      // Logged in but not admin — redirect to home
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  // Match admin pages, admin API, and everything else except Next.js internals/static
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
