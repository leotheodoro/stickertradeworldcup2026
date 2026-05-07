// __tests__/api/trade.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { GET } from '@/app/api/trade/search/route'

vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn().mockResolvedValue({
    id: 'user-1',
    name: 'Ana',
    email: 'a@a.com',
    phone: '11',
    uf: 'SP',
    city: 'São Paulo',
    cityIbgeCode: '3550308',
  }),
}))

beforeEach(() => vi.clearAllMocks())

describe('GET /api/trade/search', () => {
  it('returns 400 when stickerId is missing', async () => {
    const req = new Request('http://localhost/api/trade/search')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns empty partners array when no one has duplicates', async () => {
    vi.mocked(prisma.userSticker.findMany).mockResolvedValueOnce([])

    const req = new Request('http://localhost/api/trade/search?stickerId=sticker-abc')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.partners).toEqual([])
  })

  it('returns partners with duplicatesAvailable count', async () => {
    // First call: owners who have the sticker as duplicate
    vi.mocked(prisma.userSticker.findMany).mockResolvedValueOnce([
      {
        id: 'us1',
        userId: 'user-2',
        stickerId: 'sticker-abc',
        quantity: 3,
        user: { id: 'user-2', name: 'Carlos', phone: '21999', email: 'c@c.com' },
      } as any,
    ])
    // Second call: my duplicates
    vi.mocked(prisma.userSticker.findMany).mockResolvedValueOnce([])
    // Third call: partners' collection
    vi.mocked(prisma.userSticker.findMany).mockResolvedValueOnce([])

    const req = new Request('http://localhost/api/trade/search?stickerId=sticker-abc')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.partners).toHaveLength(1)
    expect(body.partners[0].name).toBe('Carlos')
    expect(body.partners[0].duplicatesAvailable).toBe(2) // quantity - 1
    expect(vi.mocked(prisma.userSticker.findMany).mock.calls[0]?.[0]).toMatchObject({
      where: { user: { cityIbgeCode: '3550308' } },
    })
  })
})
