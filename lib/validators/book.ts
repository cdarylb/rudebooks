import { z } from 'zod'
import { GENRES } from '@/lib/genres'

export const BookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  authors: z.array(z.string().min(1)).min(1, 'At least one author is required'),
  isbn: z.string().optional(),
  isbn13: z.string().optional(),
  cover: z.string().optional(),
  description: z.string().optional(),
  publisher: z.string().optional(),
  publishedYear: z.number().int().min(1000).max(2100).optional(),
  pageCount: z.number().int().min(1).optional(),
  genres: z.array(z.enum(GENRES)).optional(),
  locationId: z.string().min(1, 'Location is required'),
  locationNote: z.string().optional(),
  favorite: z.boolean().optional(),
  price: z.number().min(0).optional(),
})

export type BookInput = z.infer<typeof BookSchema>

export const BookUpdateSchema = BookSchema.partial()
export type BookUpdate = z.infer<typeof BookUpdateSchema>
