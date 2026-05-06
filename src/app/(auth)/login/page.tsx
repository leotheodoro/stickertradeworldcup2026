'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await login.mutateAsync({ email, password })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h4 className="text-2xl font-semibold text-[#06235b]">Entrar</h4>
        <p className="mt-1 text-sm text-slate-500">
          Use seu email e senha para acessar sua coleção.
        </p>
      </div>
      <Input
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
        required
      />
      <Input
        id="password"
        label="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />
      {error && <p className="text-sm text-[#BF0A30]">{error}</p>}
      <Button
        type="submit"
        loading={login.isPending}
        loadingText="Entrando..."
        className="mt-2 w-full"
      >
        Entrar
      </Button>
      <p className="text-center text-sm text-slate-500">
        Não tem conta?{' '}
        <Link href="/register" className="font-semibold text-[#002868] hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  )
}
