'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LocationFields } from '@/components/features/LocationFields'

type FieldErrors = Partial<Record<'name' | 'email' | 'password' | 'phone' | 'uf' | 'city' | 'cityIbgeCode', string>>

function getFieldErrors(error: unknown): FieldErrors {
  if (!error || typeof error !== 'object' || !('fieldErrors' in error)) return {}

  const fieldErrors = (error as { fieldErrors?: Record<string, string[] | undefined> }).fieldErrors ?? {}

  return Object.fromEntries(
    Object.entries(fieldErrors)
      .map(([key, value]) => [key, value?.[0]])
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  ) as FieldErrors
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'string') return error

  if (error && typeof error === 'object') {
    if ('formErrors' in error) {
      const formErrors = (error as { formErrors?: string[] }).formErrors
      if (formErrors?.[0]) return formErrors[0]
    }

    if ('error' in error && typeof (error as { error?: string }).error === 'string') {
      return (error as { error: string }).error
    }
  }

  return 'Erro ao cadastrar'
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    uf: '',
    city: '',
    cityIbgeCode: '',
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()

        if (data.error) {
          setFieldErrors(getFieldErrors(data.error))
          throw new Error(getErrorMessage(data.error))
        }

        throw new Error(getErrorMessage(data))
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
        error={fieldErrors.name}
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
        error={fieldErrors.email}
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
        error={fieldErrors.phone}
        required
      />
      <LocationFields
        value={form}
        onChange={(location) => setForm((current) => ({ ...current, ...location }))}
        errors={fieldErrors}
      />
      <Input
        id="password"
        name="password"
        label="Senha"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Mínimo 8 caracteres"
        error={fieldErrors.password}
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
