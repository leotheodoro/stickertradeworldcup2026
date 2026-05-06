// prisma/seed.ts
import { PrismaClient, StickerSection } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { ALBUM_COUNTRIES } from '../src/lib/sticker-album'
import teamStickerNames from './data/team-sticker-names.json'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const MUSEUM_STICKER_NAMES = [
  'Italy 1934 - FIFA Museum',
  'Uruguay 1950 - FIFA Museum',
  'West Germany 1954 - FIFA Museum',
  'Brazil 1962 - FIFA Museum',
  'West Germany 1974 - FIFA Museum',
  'Argentina 1986 - FIFA Museum',
  'Brazil 1994 - FIFA Museum',
  'Brazil 2002 - FIFA Museum',
  'Italy 2006 - FIFA Museum',
  'Germany 2014 - FIFA Museum',
  'Argentina 2022 - FIFA Museum',
] as const

function normalizeCountryStickerName(name: string) {
  const separatorIndex = name.lastIndexOf(' - ')
  return separatorIndex === -1 ? name : name.slice(0, separatorIndex)
}

async function main() {
  const introStickers = [
    {
      code: '00',
      name: 'Panini Logo',
      country: 'Introdução',
      section: StickerSection.intro,
      isFoil: true,
      order: 1,
    },
    {
      code: 'FWC1',
      name: 'Official Emblem',
      country: 'Introdução',
      section: StickerSection.intro,
      isFoil: true,
      order: 2,
    },
    {
      code: 'FWC2',
      name: 'Official Emblem',
      country: 'Introdução',
      section: StickerSection.intro,
      isFoil: true,
      order: 3,
    },
    {
      code: 'FWC3',
      name: 'Official Mascots',
      country: 'Introdução',
      section: StickerSection.intro,
      isFoil: true,
      order: 4,
    },
    {
      code: 'FWC4',
      name: 'Official Slogan',
      country: 'Introdução',
      section: StickerSection.intro,
      isFoil: true,
      order: 5,
    },
    {
      code: 'FWC5',
      name: 'Official Ball',
      country: 'Introdução',
      section: StickerSection.intro,
      isFoil: true,
      order: 6,
    },
    {
      code: 'FWC6',
      name: 'Canada - Host Countries & Cities',
      country: 'Introdução',
      section: StickerSection.intro,
      isFoil: true,
      order: 7,
    },
    {
      code: 'FWC7',
      name: 'Mexico - Host Countries & Cities',
      country: 'Introdução',
      section: StickerSection.intro,
      isFoil: true,
      order: 8,
    },
    {
      code: 'FWC8',
      name: 'USA - Host Countries & Cities',
      country: 'Introdução',
      section: StickerSection.intro,
      isFoil: true,
      order: 9,
    },
  ]

  const museumStickers = Array.from({ length: 11 }, (_, i) => ({
    code: `FWC${i + 9}`,
    name: MUSEUM_STICKER_NAMES[i],
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

  const countryStickers = ALBUM_COUNTRIES.flatMap(({ code, name }) => {
    const stickers = teamStickerNames[code as keyof typeof teamStickerNames]

    if (!stickers || stickers.length !== 20) {
      throw new Error(`Missing or invalid checklist data for ${code}`)
    }

    return stickers.map((stickerName, index) => ({
      code: `${code}${index + 1}`,
      name: normalizeCountryStickerName(stickerName),
      country: name,
      section: StickerSection.country,
      isFoil: index === 0,
      order: index + 1,
    }))
  })

  const all = [...introStickers, ...museumStickers, ...cocaColaStickers, ...countryStickers]

  const legacyRenames = [
    ...introStickers.map((sticker, index) => ({ oldCode: `INT${index + 1}`, sticker })),
    ...museumStickers.map((sticker, index) => ({ oldCode: `MUS${index + 1}`, sticker })),
  ]

  for (const { oldCode, sticker } of legacyRenames) {
    const legacy = await prisma.sticker.findUnique({
      where: { code: oldCode },
      select: { id: true },
    })

    if (!legacy) continue

    const current = await prisma.sticker.findUnique({
      where: { code: sticker.code },
      select: { id: true },
    })

    if (current && current.id !== legacy.id) {
      await prisma.sticker.update({
        where: { id: legacy.id },
        data: {
          name: sticker.name,
          country: sticker.country,
          section: sticker.section,
          isFoil: sticker.isFoil,
          order: sticker.order,
        },
      })
      continue
    }

    await prisma.sticker.update({
      where: { id: legacy.id },
      data: sticker,
    })
  }

  for (const sticker of all) {
    await prisma.sticker.upsert({
      where: { code: sticker.code },
      update: {
        name: sticker.name,
        country: sticker.country,
        section: sticker.section,
        isFoil: sticker.isFoil,
        order: sticker.order,
      },
      create: sticker,
    })
  }

  console.log(`Seeded ${all.length} stickers`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
