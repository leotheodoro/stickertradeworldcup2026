// __tests__/api/collection.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { PUT, DELETE } from '@/app/api/collection/[stickerId]/route'

vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn().mockResolvedValue({
    id: 'user-1',
    name: 'Ana',
    email: 'a@a.com',
    phone: '11999',
  }),
}))

beforeEach(() => vi.clearAllMocks())

const mockParams = Promise.resolve({ stickerId: 'sticker-1' })

describe('PUT /api/collection/:stickerId', () => {
  it('upserts user sticker with given quantity', async () => {
    vi.mocked(prisma.userSticker.upsert).mockResolvedValue({
      id: 'us1',
      userId: 'user-1',
      stickerId: 'sticker-1',
      quantity: 3,
    })

    const req = new Request('http://localhost/api/collection/sticker-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 3 }),
    })

    const res = await PUT(req, { params: mockParams })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.userSticker.quantity).toBe(3)
    expect(prisma.userSticker.upsert).toHaveBeenCalledWith({
      where: { userId_stickerId: { userId: 'user-1', stickerId: 'sticker-1' } },
      create: { userId: 'user-1', stickerId: 'sticker-1', quantity: 3 },
      update: { quantity: 3 },
    })
  })

  it('returns 400 for quantity = 0', async () => {
    const req = new Request('http://localhost/api/collection/sticker-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 0 }),
    })

    const res = await PUT(req, { params: mockParams })
    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/collection/:stickerId', () => {
  it('deletes the user sticker', async () => {
    vi.mocked(prisma.userSticker.delete).mockResolvedValue({} as any)

    const req = new Request('http://localhost/api/collection/sticker-1', {
      method: 'DELETE',
    })

    const res = await DELETE(req, { params: mockParams })
    expect(res.status).toBe(200)
    expect(prisma.userSticker.delete).toHaveBeenCalledWith({
      where: { userId_stickerId: { userId: 'user-1', stickerId: 'sticker-1' } },
    })
  })
})
