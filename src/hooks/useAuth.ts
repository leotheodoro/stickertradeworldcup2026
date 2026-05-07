'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  phone: string
  uf: string | null
  city: string | null
  cityIbgeCode: string | null
}

async function fetchMe(): Promise<User | null> {
  const res = await fetch('/api/auth/me')
  if (!res.ok) return null
  const data = await res.json()
  return data.user
}

export function useAuth() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    retry: false,
  })

  const login = useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Erro ao entrar')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      router.push('/collection')
    },
  })

  const logout = useMutation({
    mutationFn: async () => {
      await fetch('/api/auth/logout', { method: 'POST' })
    },
    onSuccess: () => {
      queryClient.clear()
      router.push('/login')
    },
  })

  return { user, isLoading, login, logout }
}
