import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PROTECTED_PATHS = [
  '/dashboard',
  '/books',
  '/wishlist',
  '/reading-list',
  '/locations',
  '/settings',
  '/stats',
]

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:" +
      ' https://m.media-amazon.com' +
      ' https://books.google.com' +
      ' https://covers.openlibrary.org' +
      ' https://products-images.di-static.com' +
      ' https://www.babelio.com' +
      ' https://static.fnac-static.com' +
      ' https://images.weserv.nl' +
      ' https://www.bdzoom.com' +
      ' https://encrypted-tbn0.gstatic.com' +
      ' https://encrypted-tbn3.gstatic.com' +
      ' https://i.ebayimg.com' +
      ' https://pictures.abebooks.com',
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ')
}

export default async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildCsp(nonce)

  const isProtected = PROTECTED_PATHS.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  )

  if (isProtected) {
    const token = await getToken({ req: request })
    if (!token) {
      const signInUrl = new URL('/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', request.url)
      const redirect = NextResponse.redirect(signInUrl)
      redirect.headers.set('Content-Security-Policy', csp)
      return redirect
    }
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
  return response
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|manifest\\.json).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
