import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import crypto from 'crypto'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateInviteCode(): string {
  return crypto.randomBytes(6).toString('hex').toUpperCase()
}

/** Normalize ISBN-10 or ISBN-13 — strip dashes/spaces */
export function normalizeIsbn(isbn: string): string {
  return isbn.replace(/[-\s]/g, '')
}


export function formatAuthors(authors: string[]): string {
  if (!authors.length) return 'Unknown author'
  if (authors.length === 1) return authors[0]
  if (authors.length === 2) return authors.join(' & ')
  return `${authors[0]} et al.`
}

export function priorityLabel(priority: 'low' | 'medium' | 'high'): string {
  return { low: 'Basse', medium: 'Moyenne', high: 'Haute' }[priority]
}

export function priorityColor(priority: 'low' | 'medium' | 'high'): string {
  return {
    low:    'bg-surface-3 text-ink-muted border border-edge',
    medium: 'bg-primary/15 text-primary border border-primary/30',
    high:   'bg-accent/15 text-accent-400 border border-accent/30',
  }[priority]
}
