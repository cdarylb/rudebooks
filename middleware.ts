import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: { signIn: '/signin' },
})

export const config = {
  matcher: ['/dashboard/:path*', '/books/:path*', '/wishlist/:path*', '/reading-list/:path*', '/locations/:path*', '/settings/:path*', '/stats/:path*'],
}
