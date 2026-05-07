// lib/validation/auth.schema.ts
import { z } from 'zod'

export const locationSchema = z.object({
  uf: z.string().length(2, 'UF obrigatória'),
  city: z.string().min(1, 'Cidade obrigatória'),
  cityIbgeCode: z.string().min(1, 'Cidade obrigatória'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  phone: z.string().min(8, 'Telefone inválido'),
}).merge(locationSchema)

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type LocationInput = z.infer<typeof locationSchema>
