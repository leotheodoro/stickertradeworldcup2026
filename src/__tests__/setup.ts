// __tests__/setup.ts
import { vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    sticker: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    userSticker: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  },
}))
