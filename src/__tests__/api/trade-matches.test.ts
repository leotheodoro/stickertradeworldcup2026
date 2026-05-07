import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { GET as getMatchDetail } from '@/app/api/trade/matches/[userId]/route'
import { GET as getMatches } from '@/app/api/trade/matches/route'

vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn().mockResolvedValue({
    id: 'user-1',
    name: 'Ana',
    email: 'ana@example.com',
    phone: '11999999999',
    uf: 'SP',
    city: 'São Paulo',
    cityIbgeCode: '3550308',
  }),
}))

const myStickers = [
  {
    id: 'us-1',
    userId: 'user-1',
    quantity: 2,
    sticker: {
      id: 'sticker-a',
      code: 'BRA2',
      name: 'Jogador A',
      country: 'Brasil',
      section: 'country',
      order: 2,
      isFoil: false,
    },
  },
  {
    id: 'us-2',
    userId: 'user-1',
    quantity: 2,
    sticker: {
      id: 'sticker-f',
      code: 'BRA1',
      name: 'Escudo do Brasil',
      country: 'Brasil',
      section: 'country',
      order: 1,
      isFoil: true,
    },
  },
  {
    id: 'us-3',
    userId: 'user-1',
    quantity: 1,
    sticker: {
      id: 'sticker-b',
      code: 'BRA3',
      name: 'Jogador B',
      country: 'Brasil',
      section: 'country',
      order: 3,
      isFoil: false,
    },
  },
]

const partnerStickers = [
  {
    id: 'p1-1',
    userId: 'user-2',
    quantity: 2,
    user: { id: 'user-2', name: 'Bruno', phone: '21999999999' },
    sticker: {
      id: 'sticker-c',
      code: 'ARG2',
      name: 'Jogador C',
      country: 'Argentina',
      section: 'country',
      order: 2,
      isFoil: false,
    },
  },
  {
    id: 'p1-2',
    userId: 'user-2',
    quantity: 2,
    user: { id: 'user-2', name: 'Bruno', phone: '21999999999' },
    sticker: {
      id: 'sticker-g',
      code: 'ARG1',
      name: 'Escudo da Argentina',
      country: 'Argentina',
      section: 'country',
      order: 1,
      isFoil: true,
    },
  },
  {
    id: 'p1-3',
    userId: 'user-2',
    quantity: 1,
    user: { id: 'user-2', name: 'Bruno', phone: '21999999999' },
    sticker: {
      id: 'sticker-b',
      code: 'BRA3',
      name: 'Jogador B',
      country: 'Brasil',
      section: 'country',
      order: 3,
      isFoil: false,
    },
  },
  {
    id: 'p2-1',
    userId: 'user-3',
    quantity: 2,
    user: { id: 'user-3', name: 'Carla', phone: '31999999999' },
    sticker: {
      id: 'sticker-d',
      code: 'MEX2',
      name: 'Jogador D',
      country: 'México',
      section: 'country',
      order: 2,
      isFoil: false,
    },
  },
  {
    id: 'p2-2',
    userId: 'user-3',
    quantity: 1,
    user: { id: 'user-3', name: 'Carla', phone: '31999999999' },
    sticker: {
      id: 'sticker-a',
      code: 'BRA2',
      name: 'Jogador A',
      country: 'Brasil',
      section: 'country',
      order: 2,
      isFoil: false,
    },
  },
  {
    id: 'p2-3',
    userId: 'user-3',
    quantity: 1,
    user: { id: 'user-3', name: 'Carla', phone: '31999999999' },
    sticker: {
      id: 'sticker-f',
      code: 'BRA1',
      name: 'Escudo do Brasil',
      country: 'Brasil',
      section: 'country',
      order: 1,
      isFoil: true,
    },
  },
  {
    id: 'p3-1',
    userId: 'user-4',
    quantity: 2,
    user: { id: 'user-4', name: 'Diego', phone: '41999999999' },
    sticker: {
      id: 'sticker-e',
      code: 'USA2',
      name: 'Jogador E',
      country: 'Estados Unidos',
      section: 'country',
      order: 2,
      isFoil: false,
    },
  },
]

beforeEach(() => vi.clearAllMocks())

describe('GET /api/trade/matches', () => {
  it('returns 400 when limit is invalid', async () => {
    const req = new Request('http://localhost/api/trade/matches?limit=20')
    const res = await getMatches(req)

    expect(res.status).toBe(400)
  })

  it('returns ranked mutual matches and one-way matches separately', async () => {
    vi.mocked(prisma.userSticker.findMany)
      .mockResolvedValueOnce(myStickers as never)
      .mockResolvedValueOnce(partnerStickers as never)

    const req = new Request('http://localhost/api/trade/matches?limit=15')
    const res = await getMatches(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.bestMatches).toHaveLength(2)
    expect(body.bestMatches[0].name).toBe('Bruno')
    expect(body.bestMatches[0].foilPairs).toBe(1)
    expect(body.bestMatches[0].regularPairs).toBe(1)
    expect(body.bestMatches[0].successRate).toBeGreaterThan(body.bestMatches[1].successRate)
    expect(vi.mocked(prisma.userSticker.findMany).mock.calls[1]?.[0]).toMatchObject({
      where: { user: { cityIbgeCode: '3550308' } },
    })

    expect(body.canHelpYou).toHaveLength(1)
    expect(body.canHelpYou[0].name).toBe('Carla')
    expect(body.canHelpYou[0].youCanGiveThemCount).toBe(0)
    expect(body.canHelpYou[0].successRate).toBeLessThan(body.bestMatches[0].successRate)
  })
})

describe('GET /api/trade/matches/[userId]', () => {
  it('returns 404 when partner is missing', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null)

    const res = await getMatchDetail(new Request('http://localhost/api/trade/matches/user-9'), {
      params: Promise.resolve({ userId: 'user-9' }),
    })

    expect(res.status).toBe(404)
  })

  it('returns grouped detail data including foil-compatible trades', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user-2',
      name: 'Bruno',
      phone: '21999999999',
      cityIbgeCode: '3550308',
    } as never)

    vi.mocked(prisma.userSticker.findMany)
      .mockResolvedValueOnce(myStickers as never)
      .mockResolvedValueOnce(
        partnerStickers
          .filter((sticker) => sticker.userId === 'user-2')
          .map(({ user: _user, ...rest }) => rest) as never,
      )

    const res = await getMatchDetail(new Request('http://localhost/api/trade/matches/user-2'), {
      params: Promise.resolve({ userId: 'user-2' }),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.match.name).toBe('Bruno')
    expect(body.match.regularPairs).toBe(1)
    expect(body.match.foilPairs).toBe(1)
    expect(body.match.theyCanGiveYouFoil.map((sticker: { code: string }) => sticker.code)).toEqual([
      'ARG1',
    ])
    expect(body.match.youCanGiveThemFoil.map((sticker: { code: string }) => sticker.code)).toEqual([
      'BRA1',
    ])
  })
})
