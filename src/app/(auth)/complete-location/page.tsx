'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LocationFields } from '@/components/features/LocationFields'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

type FieldErrors = Partial<Record<'uf' | 'city' | 'cityIbgeCode', string>>

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

  if (error && typeof error === 'object' && 'formErrors' in error) {
    const formErrors = (error as { formErrors?: string[] }).formErrors
    if (formErrors?.[0]) return formErrors[0]
  }

  return 'Erro ao salvar localização'
}

export default function CompleteLocationPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [form, setForm] = useState({ uf: '', city: '', cityIbgeCode: '' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return

    setForm({
      uf: user.uf ?? '',
      city: user.city ?? '',
      cityIbgeCode: user.cityIbgeCode ?? '',
    })
  }, [user])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setFieldErrors({})

    try {
      const res = await fetch('/api/auth/location', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()

        if (data.error) {
          setFieldErrors(getFieldErrors(data.error))
          throw new Error(getErrorMessage(data.error))
        }

        throw new Error('Erro ao salvar localização')
      }

      router.push('/collection')
      router.refresh()
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : 'Erro ao salvar localização',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h4 className="text-2xl font-semibold text-[#06235b]">Complete sua localização</h4>
        <p className="mt-1 text-sm text-slate-500">
          Para mostrar trocas só da sua cidade, precisamos saber onde você está.
        </p>
      </div>

      <LocationFields value={form} onChange={setForm} errors={fieldErrors} />

      {error && <p className="text-sm text-[#BF0A30]">{error}</p>}

      <Button
        type="submit"
        loading={saving || isLoading}
        loadingText="Salvando..."
        className="mt-2 w-full"
      >
        Salvar localização
      </Button>
    </form>
  )
}
