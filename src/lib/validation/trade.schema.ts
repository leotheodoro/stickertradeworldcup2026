// lib/validation/trade.schema.ts
import { z } from 'zod'

export const tradeSearchSchema = z.object({
  stickerId: z.string().min(1, 'ID da figurinha obrigatório'),
})

export type TradeSearchInput = z.infer<typeof tradeSearchSchema>
