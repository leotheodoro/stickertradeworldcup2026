export const ALBUM_COUNTRIES = [
  { code: 'MEX', name: 'México' },
  { code: 'RSA', name: 'África do Sul' },
  { code: 'KOR', name: 'Coreia do Sul' },
  { code: 'CZE', name: 'Tchéquia' },
  { code: 'CAN', name: 'Canadá' },
  { code: 'BIH', name: 'Bosnia e Herzegovina' },
  { code: 'QAT', name: 'Qatar' },
  { code: 'SUI', name: 'Suíça' },
  { code: 'BRA', name: 'Brasil' },
  { code: 'MAR', name: 'Marrocos' },
  { code: 'HAI', name: 'Haiti' },
  { code: 'SCO', name: 'Escócia' },
  { code: 'USA', name: 'Estados Unidos' },
  { code: 'PAR', name: 'Paraguai' },
  { code: 'AUS', name: 'Australia' },
  { code: 'TUR', name: 'Turquia' },
  { code: 'GER', name: 'Alemanha' },
  { code: 'CUW', name: 'Curaçao' },
  { code: 'CIV', name: 'Costa do Marfim' },
  { code: 'ECU', name: 'Equador' },
  { code: 'NED', name: 'Holanda' },
  { code: 'JPN', name: 'Japão' },
  { code: 'SWE', name: 'Suécia' },
  { code: 'TUN', name: 'Tunísia' },
  { code: 'BEL', name: 'Belgium' },
  { code: 'EGY', name: 'Egito' },
  { code: 'IRN', name: 'Irã' },
  { code: 'NZL', name: 'Nova Zelândia' },
  { code: 'ESP', name: 'Espanha' },
  { code: 'CPV', name: 'Cabo Verde' },
  { code: 'KSA', name: 'Arábia Saudita' },
  { code: 'URU', name: 'Uruguai' },
  { code: 'FRA', name: 'França' },
  { code: 'SEN', name: 'Senegal' },
  { code: 'IRQ', name: 'Iraque' },
  { code: 'NOR', name: 'Noruega' },
  { code: 'ARG', name: 'Argentina' },
  { code: 'ALG', name: 'Algeria' },
  { code: 'AUT', name: 'Austria' },
  { code: 'JOR', name: 'Jordânia' },
  { code: 'POR', name: 'Portugal' },
  { code: 'COD', name: 'Congo DR' },
  { code: 'UZB', name: 'Uzbequistão' },
  { code: 'COL', name: 'Colômbia' },
  { code: 'ENG', name: 'Inglaterra' },
  { code: 'CRO', name: 'Croácia' },
  { code: 'GHA', name: 'Gana' },
  { code: 'PAN', name: 'Panamá' },
] as const

const COUNTRY_ORDER = new Map<string, number>(
  ALBUM_COUNTRIES.map((country, index) => [country.name, index]),
)

const SECTION_ORDER = {
  intro: 0,
  country: 1,
  museum: 2,
  coca_cola: 3,
} as const

type SortableSticker = {
  section: string
  country: string
  order: number
}

export function compareAlbumCountries(a: string, b: string) {
  return (
    (COUNTRY_ORDER.get(a) ?? Number.MAX_SAFE_INTEGER) -
    (COUNTRY_ORDER.get(b) ?? Number.MAX_SAFE_INTEGER)
  )
}

export function compareAlbumStickers(a: SortableSticker, b: SortableSticker) {
  const sectionDiff =
    (SECTION_ORDER[a.section as keyof typeof SECTION_ORDER] ?? Number.MAX_SAFE_INTEGER) -
    (SECTION_ORDER[b.section as keyof typeof SECTION_ORDER] ?? Number.MAX_SAFE_INTEGER)

  if (sectionDiff !== 0) return sectionDiff

  if (a.section === 'country' && b.section === 'country') {
    const countryDiff = compareAlbumCountries(a.country, b.country)
    if (countryDiff !== 0) return countryDiff
  } else {
    const countryDiff = a.country.localeCompare(b.country)
    if (countryDiff !== 0) return countryDiff
  }

  return a.order - b.order
}
