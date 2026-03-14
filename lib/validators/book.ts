import { z } from 'zod'

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
  language: z.string().optional(),
  genres: z.array(z.string()).optional(),
  locationId: z.string().optional(),
  locationNote: z.string().optional(),
  status: z.enum(['owned', 'lent']).default('owned'),
  lentTo: z.string().optional(),
})

export type BookInput = z.infer<typeof BookSchema>

export const BookUpdateSchema = BookSchema.partial()
export type BookUpdate = z.infer<typeof BookUpdateSchema>
