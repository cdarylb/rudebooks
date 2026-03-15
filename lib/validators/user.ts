import { z } from 'zod'

export const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  libraryName: z.string().min(2).max(100).optional(),
  inviteCode: z.string().optional(),
}).refine((d) => d.libraryName || d.inviteCode, {
  message: 'Fournissez un nom de bibliothèque ou un code d\'invitation',
})

export type SignupInput = z.infer<typeof SignupSchema>

export const SigninSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
