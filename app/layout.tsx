import type { Metadata, Viewport } from 'next'
import { DM_Sans, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RudeBooks',
  description: 'Shared home library manager',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'RudeBooks' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2563EB',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Force dynamic rendering so Next.js reads x-nonce from middleware
  // and applies it to its generated inline scripts (required for nonce-based CSP).
  headers()

  return (
    <html lang="fr" className={`${dmSans.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
