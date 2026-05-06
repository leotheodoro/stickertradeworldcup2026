'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro ao cadastrar')
      }
      router.push('/collection')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h4 className="text-2xl font-semibold text-[#06235b]">Criar conta</h4>
        <p className="mt-1 text-sm text-slate-500">
          Cadastre-se para marcar sua coleção e abrir novas trocas.
        </p>
      </div>
      <Input
        id="name"
        name="name"
        label="Nome completo"
        value={form.name}
        onChange={handleChange}
        placeholder="João Silva"
        required
      />
      <Input
        id="email"
        name="email"
        label="Email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="seu@email.com"
        required
      />
      <Input
        id="phone"
        name="phone"
        label="WhatsApp (com DDD)"
        type="tel"
        value={form.phone}
        onChange={handleChange}
        placeholder="11999887766"
        required
      />
      <Input
        id="password"
        name="password"
        label="Senha"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Mínimo 8 caracteres"
        required
      />
      {error && <p className="text-sm text-[#BF0A30]">{error}</p>}
      <Button type="submit" loading={loading} loadingText="Cadastrando..." className="mt-2 w-full">
        Criar conta
      </Button>
      <p className="text-center text-sm text-slate-500">
        Já tem conta?{' '}
        <Link href="/login" className="font-semibold text-[#002868] hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  )
}
