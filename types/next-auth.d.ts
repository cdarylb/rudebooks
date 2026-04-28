import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      libraryId: string
      role: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    libraryId: string
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    libraryId?: string
    role?: string
  }
}
