import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import dbConnect from './db'
import User from '@/models/User'

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5

const loginAttempts = new Map<string, { count: number; firstAt: number }>()

function recordFailure(key: string) {
  const now = Date.now()
  const record = loginAttempts.get(key)
  if (record && now - record.firstAt < WINDOW_MS) {
    record.count++
  } else {
    loginAttempts.set(key, { count: 1, firstAt: now })
  }
}

function isBlocked(key: string): boolean {
  const now = Date.now()
  const record = loginAttempts.get(key)
  if (!record) return false
  if (now - record.firstAt >= WINDOW_MS) {
    loginAttempts.delete(key)
    return false
  }
  return record.count >= MAX_ATTEMPTS
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        const forwarded = req.headers?.['x-forwarded-for']
        const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)
          ?.split(',')[0]
          ?.trim() ?? 'unknown'
        const key = `${ip}:${credentials.email.toLowerCase()}`

        if (isBlocked(key)) return null

        await dbConnect()
        const user = await User.findOne({ email: credentials.email.toLowerCase() })
        if (!user) {
          recordFailure(key)
          return null
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) {
          recordFailure(key)
          return null
        }

        loginAttempts.delete(key)
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.avatar ?? null,
          libraryId: user.libraryId.toString(),
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.libraryId = user.libraryId
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.libraryId = token.libraryId as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  session: { strategy: 'jwt' },
}

export default NextAuth(authOptions)
