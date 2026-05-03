// __tests__/lib/jwt.test.ts
import { describe, it, expect } from 'vitest'
import { signJwt, verifyJwt } from '@/lib/jwt'

process.env.JWT_SECRET = 'test-secret-32-chars-minimum-pad!!'

describe('JWT utilities', () => {
  it('signs and verifies a token with the user id', async () => {
    const token = await signJwt({ sub: 'user-123' })
    expect(typeof token).toBe('string')
    const payload = await verifyJwt(token)
    expect(payload.sub).toBe('user-123')
  })

  it('throws when verifying a tampered token', async () => {
    const token = await signJwt({ sub: 'user-123' })
    const tampered = token.slice(0, -4) + 'XXXX'
    await expect(verifyJwt(tampered)).rejects.toThrow()
  })
})
