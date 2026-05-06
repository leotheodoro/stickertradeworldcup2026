// lib/validation/collection.schema.ts
import { z } from 'zod'

export const updateQuantitySchema = z.object({
  quantity: z
    .number()
    .int('Quantidade deve ser inteira')
    .min(1, 'Quantidade mínima é 1')
    .max(99, 'Quantidade máxima é 99'),
})

export type UpdateQuantityInput = z.infer<typeof updateQuantitySchema>
