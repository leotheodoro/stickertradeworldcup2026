'use client'

import { useEffect, useState } from 'react'
import { BRAZIL_STATES, type IbgeCity } from '@/lib/brazil'
import { CitySelect } from '@/components/features/CitySelect'
import { Select } from '@/components/ui/select'

interface LocationValue {
  uf: string
  city: string
  cityIbgeCode: string
}

interface LocationErrors {
  uf?: string
  city?: string
  cityIbgeCode?: string
}

interface LocationFieldsProps {
  value: LocationValue
  onChange: (value: LocationValue) => void
  errors?: LocationErrors
}

export function LocationFields({ value, onChange, errors }: LocationFieldsProps) {
  const [cities, setCities] = useState<IbgeCity[]>([])
  const [isLoadingCities, setIsLoadingCities] = useState(false)

  useEffect(() => {
    if (!value.uf) {
      setCities([])
      return
    }

    const controller = new AbortController()

    async function loadCities() {
      setIsLoadingCities(true)

      try {
        const res = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${value.uf}/municipios`,
          { signal: controller.signal },
        )

        if (!res.ok) throw new Error('Erro ao carregar cidades')

        const data = (await res.json()) as IbgeCity[]
        setCities(data)
      } catch (error) {
        if ((error as Error).name === 'AbortError') return
        setCities([])
      } finally {
        setIsLoadingCities(false)
      }
    }

    void loadCities()

    return () => controller.abort()
  }, [value.uf])

  return (
    <>
      <Select
        id="uf"
        name="uf"
        label="Estado"
        value={value.uf}
        onChange={(event) =>
          onChange({
            uf: event.target.value,
            city: '',
            cityIbgeCode: '',
          })
        }
        error={errors?.uf}
        required
      >
        <option value="">Selecione seu estado</option>
        {BRAZIL_STATES.map((state) => (
          <option key={state.uf} value={state.uf}>
            {state.name}
          </option>
        ))}
      </Select>

      <CitySelect
        id="city"
        label="Cidade"
        cities={cities}
        value={{ city: value.city, cityIbgeCode: value.cityIbgeCode }}
        onChange={({ city, cityIbgeCode }) => onChange({ ...value, city, cityIbgeCode })}
        disabled={!value.uf}
        loading={isLoadingCities}
        error={errors?.city ?? errors?.cityIbgeCode}
        placeholder={value.uf ? 'Selecione sua cidade' : 'Escolha primeiro o estado'}
      />
    </>
  )
}
