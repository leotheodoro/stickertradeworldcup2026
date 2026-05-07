// __tests__/api/auth/register.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { POST } from '@/app/api/auth/register/route'

vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn().mockResolvedValue('hashed-password') },
}))
vi.mock('@/lib/jwt', () => ({
  signJwt: vi.fn().mockResolvedValue('mock-token'),
}))

const mockUser = {
  id: 'u1',
  name: 'Ana',
  email: 'ana@test.com',
  phone: '11999887766',
  uf: 'SP',
  city: 'São Paulo',
  cityIbgeCode: '3550308',
  createdAt: new Date(),
  updatedAt: new Date(),
}

beforeEach(() => vi.clearAllMocks())

describe('POST /api/auth/register', () => {
  it('creates a user and returns 201 with token cookie', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({ ...mockUser, password: 'hashed' })

    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ana',
        email: 'ana@test.com',
        password: 'senhaforte',
        phone: '11999887766',
        uf: 'SP',
        city: 'São Paulo',
        cityIbgeCode: '3550308',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.user.email).toBe('ana@test.com')
    expect(body.user.password).toBeUndefined()
    expect(res.headers.get('Set-Cookie')).toContain('token=mock-token')
  })

  it('returns 409 when email already exists', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, password: 'hashed' })

    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ana',
        email: 'ana@test.com',
        password: 'senhaforte',
        phone: '11999887766',
        uf: 'SP',
        city: 'São Paulo',
        cityIbgeCode: '3550308',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(409)
  })

  it('returns 400 for invalid payload', async () => {
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
