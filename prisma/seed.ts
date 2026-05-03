// prisma/seed.ts
import { PrismaClient, StickerSection } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const COUNTRIES: { code: string; name: string }[] = [
  { code: 'ALG', name: 'Algeria' },
  { code: 'ARG', name: 'Argentina' },
  { code: 'AUS', name: 'Australia' },
  { code: 'AUT', name: 'Austria' },
  { code: 'BEL', name: 'Belgium' },
  { code: 'BIH', name: 'Bosnia e Herzegovina' },
  { code: 'BRA', name: 'Brasil' },
  { code: 'CAN', name: 'Canadá' },
  { code: 'CPV', name: 'Cabo Verde' },
  { code: 'COL', name: 'Colômbia' },
  { code: 'COD', name: 'Congo DR' },
  { code: 'CRO', name: 'Croácia' },
  { code: 'CUW', name: 'Curaçao' },
  { code: 'CZE', name: 'Tchéquia' },
  { code: 'ECU', name: 'Equador' },
  { code: 'EGY', name: 'Egito' },
  { code: 'ENG', name: 'Inglaterra' },
  { code: 'FRA', name: 'França' },
  { code: 'GER', name: 'Alemanha' },
  { code: 'GHA', name: 'Gana' },
  { code: 'HAI', name: 'Haiti' },
  { code: 'IRN', name: 'Irã' },
  { code: 'IRQ', name: 'Iraque' },
  { code: 'CIV', name: 'Costa do Marfim' },
  { code: 'JPN', name: 'Japão' },
  { code: 'JOR', name: 'Jordânia' },
  { code: 'MEX', name: 'México' },
  { code: 'MAR', name: 'Marrocos' },
  { code: 'NED', name: 'Holanda' },
  { code: 'NZL', name: 'Nova Zelândia' },
  { code: 'NOR', name: 'Noruega' },
  { code: 'PAN', name: 'Panamá' },
  { code: 'PAR', name: 'Paraguai' },
  { code: 'POR', name: 'Portugal' },
  { code: 'QAT', name: 'Qatar' },
  { code: 'KSA', name: 'Arábia Saudita' },
  { code: 'SCO', name: 'Escócia' },
  { code: 'SEN', name: 'Senegal' },
  { code: 'RSA', name: 'África do Sul' },
  { code: 'KOR', name: 'Coreia do Sul' },
  { code: 'ESP', name: 'Espanha' },
  { code: 'SWE', name: 'Suécia' },
  { code: 'SUI', name: 'Suíça' },
  { code: 'TUN', name: 'Tunísia' },
  { code: 'TUR', name: 'Turquia' },
  { code: 'URU', name: 'Uruguai' },
  { code: 'USA', name: 'Estados Unidos' },
  { code: 'UZB', name: 'Uzbequistão' },
]

async function main() {
  const introStickers = Array.from({ length: 9 }, (_, i) => ({
    code: `INT${i + 1}`,
    name: `Introdução ${i + 1}`,
    country: 'Introdução',
    section: StickerSection.intro,
    isFoil: false,
    order: i + 1,
  }))

  const museumStickers = Array.from({ length: 11 }, (_, i) => ({
    code: `MUS${i + 1}`,
    name: `FIFA Museum ${i + 1}`,
    country: 'FIFA Museum',
    section: StickerSection.museum,
    isFoil: false,
    order: i + 1,
  }))

  const cocaColaStickers = Array.from({ length: 12 }, (_, i) => ({
    code: `CC${i + 1}`,
    name: `Coca-Cola ${i + 1}`,
    country: 'Coca-Cola',
    section: StickerSection.coca_cola,
    isFoil: false,
    order: i + 1,
  }))

  const countryStickers = COUNTRIES.flatMap(({ code, name }) =>
    Array.from({ length: 20 }, (_, i) => ({
      code: `${code}${i + 1}`,
      name: i === 0 ? `Escudo - ${name}` : `Jogador ${i} - ${name}`,
      country: name,
      section: StickerSection.country,
      isFoil: i === 0,
      order: i + 1,
    })),
  )

  const all = [...introStickers, ...museumStickers, ...cocaColaStickers, ...countryStickers]

  await prisma.sticker.createMany({ data: all, skipDuplicates: true })

  console.log(`Seeded ${all.length} stickers`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
