import { z } from 'zod'
export const shelfSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Geef je plank een naam.')
      .max(100, 'Gebruik maximaal 100 tekens.'),
    description: z.string().trim().max(2000, 'Gebruik maximaal 2000 tekens.'),
    isPublic: z.boolean(),
  })
  .strict()
export type ShelfInput = z.infer<typeof shelfSchema>
