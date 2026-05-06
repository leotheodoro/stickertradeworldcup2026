// lib/validation/trade.schema.ts
import { z } from 'zod'

export const tradeSearchSchema = z.object({
  stickerId: z.string().min(1, 'ID da figurinha obrigatório'),
})

export const tradeMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(15).default(15),
})

export const tradeMatchParamsSchema = z.object({
  userId: z.string().min(1, 'ID do usuário obrigatório'),
})

export type TradeSearchInput = z.infer<typeof tradeSearchSchema>
export type TradeMatchesQueryInput = z.infer<typeof tradeMatchesQuerySchema>
export type TradeMatchParamsInput = z.infer<typeof tradeMatchParamsSchema>
