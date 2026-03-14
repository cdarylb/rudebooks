import { z } from 'zod'

export const WishlistItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  authors: z.array(z.string()).optional(),
  isbn: z.string().optional(),
  cover: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  price: z.number().positive().optional(),
  currency: z.string().default('EUR'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  notes: z.string().optional(),
})

export type WishlistItemInput = z.infer<typeof WishlistItemSchema>

export const WishlistItemUpdateSchema = WishlistItemSchema.partial().extend({
  status: z.enum(['wanted', 'purchased']).optional(),
})
export type WishlistItemUpdate = z.infer<typeof WishlistItemUpdateSchema>
