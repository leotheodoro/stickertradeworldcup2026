# Figurinhas da Copa — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js 15 full-stack app for Brazilian World Cup sticker collectors to manage their 2026 Panini album and find WhatsApp trading partners.

**Architecture:** Monorepo Next.js 15 App Router. Route Handlers serve a REST API. Prisma 6 + PostgreSQL (Docker Compose) for persistence. Custom JWT auth (`jose` + httpOnly cookie). React Query v5 for client data fetching. Base UI primitives (`@base-ui-components/react`). All UI copy in pt-BR.

**Tech Stack:** Next.js 15, Prisma 6, PostgreSQL 16, `jose`, `bcryptjs`, `@tanstack/react-query` v5, `@base-ui-components/react`, Zod, Tailwind CSS 4, Vitest, ESLint, Prettier.

---

## File Map

```
figurinhasdacopa/
├── app/
│   ├── layout.tsx                        root layout — fonts, QueryClientProvider
│   ├── page.tsx                          redirect → /collection or /login
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   ├── stickers/route.ts             GET with country/search/section filters
│   │   ├── collection/
│   │   │   ├── route.ts                  GET current user's stickers
│   │   │   └── [stickerId]/route.ts      PUT (upsert quantity), DELETE
│   │   └── trade/
│   │       └── search/route.ts           GET trading partners for a sticker
│   ├── (auth)/
│   │   ├── layout.tsx                    centered card layout
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── (app)/
│       ├── layout.tsx                    nav bar + auth guard
│       ├── collection/
│       │   ├── page.tsx
│       │   └── loading.tsx
│       └── trade/
│           ├── page.tsx
│           └── loading.tsx
├── components/
│   ├── providers.tsx                     QueryClientProvider (client)
│   ├── ui/
│   │   ├── button.tsx                    Base UI Button wrapper
│   │   ├── input.tsx                     Base UI Field wrapper
│   │   ├── dialog.tsx                    Base UI Dialog wrapper
│   │   ├── tooltip.tsx                   Base UI Tooltip wrapper
│   │   └── skeleton.tsx                  Tailwind animate-pulse div
│   └── features/
│       ├── StickerCard.tsx
│       ├── QuantityInput.tsx
│       ├── StickerGrid.tsx               client component — uses useStickers + useCollection
│       ├── StickerGridSkeleton.tsx
│       ├── CountryFilter.tsx
│       ├── SearchBar.tsx
│       └── TradingPartnerCard.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useStickers.ts
│   ├── useCollection.ts
│   └── useTrade.ts
├── lib/
│   ├── prisma.ts                         singleton PrismaClient
│   ├── jwt.ts                            signJwt / verifyJwt (jose)
│   ├── auth.ts                           getAuthUser() reads cookie
│   ├── whatsapp.ts                       buildWhatsAppUrl(phone, sticker)
│   └── validation/
│       ├── auth.schema.ts
│       ├── collection.schema.ts
│       └── trade.schema.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── __tests__/
│   ├── lib/jwt.test.ts
│   ├── api/auth/register.test.ts
│   ├── api/collection.test.ts
│   └── api/trade.test.ts
├── middleware.ts
├── vitest.config.ts
├── docker-compose.yml
├── .env.example
└── tailwind.config.ts
```

---

## Phase 1 — Infrastructure

### Task 1: Bootstrap Next.js 15 + install dependencies

**Files:**
- Create: `package.json` (generated)
- Create: `package.json` dev/prod deps added

- [ ] **Step 1: Scaffold project**

Run from `/Users/thdr/www/personal/`:
```bash
npx create-next-app@15 figurinhasdacopa \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```
When prompted: **No** to Turbopack (keep webpack for stability).

- [ ] **Step 2: Install production dependencies**

```bash
cd figurinhasdacopa
npm install \
  prisma @prisma/client \
  jose \
  bcryptjs \
  @tanstack/react-query \
  @base-ui-components/react \
  zod
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D \
  @types/bcryptjs \
  vitest \
  @vitejs/plugin-react \
  @testing-library/react \
  @testing-library/jest-dom \
  vite-tsconfig-paths \
  ts-node
```

- [ ] **Step 4: Verify installs**

```bash
npm ls prisma jose zod vitest --depth=0
```
Expected: all four listed with version numbers, no errors.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: bootstrap Next.js 15 project with all dependencies"
```

---

### Task 2: Tailwind visual identity

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: Replace tailwind.config.ts**

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        copa: {
          blue: '#002868',
          red: '#BF0A30',
          gold: '#F5C518',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        bebas: ['var(--font-bebas)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Update globals.css**

```css
/* app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-bebas: 'Bebas Neue', sans-serif;
  --font-inter: 'Inter', sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  font-family: var(--font-inter);
  background-color: #f8fafc;
  color: #1e293b;
}
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "chore: configure Tailwind with FIFA World Cup 2026 visual identity"
```

---

### Task 3: Prettier + ESLint

**Files:**
- Create: `.prettierrc`
- Modify: `.eslintrc.json`

- [ ] **Step 1: Create .prettierrc**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": []
}
```

- [ ] **Step 2: Update .eslintrc.json**

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

- [ ] **Step 3: Add format script to package.json**

Open `package.json` and add to `"scripts"`:
```json
"format": "prettier --write .",
"format:check": "prettier --check ."
```

- [ ] **Step 4: Commit**

```bash
git add .prettierrc .eslintrc.json package.json
git commit -m "chore: configure Prettier and ESLint"
```

---

### Task 4: Docker Compose + environment setup

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `.env.local` (gitignored)

- [ ] **Step 1: Create docker-compose.yml**

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: copa
      POSTGRES_PASSWORD: copa
      POSTGRES_DB: figurinhas
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

- [ ] **Step 2: Create .env.example**

```bash
# .env.example
DATABASE_URL="postgresql://copa:copa@localhost:5432/figurinhas"
JWT_SECRET="change-me-in-production-use-32-chars-minimum"
```

- [ ] **Step 3: Create .env.local**

```bash
# .env.local  (already in .gitignore via create-next-app)
DATABASE_URL="postgresql://copa:copa@localhost:5432/figurinhas"
JWT_SECRET="dev-secret-do-not-use-in-prod-1234567"
```

- [ ] **Step 4: Start database**

```bash
docker compose up -d
```
Expected output: `Container figurinhasdacopa-db-1 Started`

- [ ] **Step 5: Verify connection**

```bash
docker compose exec db psql -U copa -d figurinhas -c "SELECT version();"
```
Expected: PostgreSQL 16.x version string.

- [ ] **Step 6: Commit**

```bash
git add docker-compose.yml .env.example
git commit -m "chore: add Docker Compose PostgreSQL + env template"
```

---

### Task 5: Prisma schema + migration

**Files:**
- Create: `prisma/schema.prisma`
- Run: migration

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

- [ ] **Step 2: Replace prisma/schema.prisma**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String        @id @default(cuid())
  name      String
  email     String        @unique
  password  String
  phone     String
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  stickers  UserSticker[]
}

model Sticker {
  id      String          @id @default(cuid())
  code    String          @unique
  name    String
  country String
  section StickerSection
  isFoil  Boolean         @default(false)
  order   Int
  users   UserSticker[]
}

enum StickerSection {
  country
  intro
  museum
  coca_cola
}

model UserSticker {
  id        String   @id @default(cuid())
  userId    String
  stickerId String
  quantity  Int      @default(1)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  sticker   Sticker  @relation(fields: [stickerId], references: [id])

  @@unique([userId, stickerId])
}
```

- [ ] **Step 3: Run migration**

```bash
npx prisma migrate dev --name init
```
Expected: Migration created and applied. `prisma/migrations/` directory appears.

- [ ] **Step 4: Generate client**

```bash
npx prisma generate
```
Expected: `✔ Generated Prisma Client`

- [ ] **Step 5: Commit**

```bash
git add prisma/
git commit -m "feat: add Prisma schema with User, Sticker, UserSticker models"
```

---

### Task 6: Seed script

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (prisma.seed)

- [ ] **Step 1: Add seed config to package.json**

Add to `package.json` (top-level, alongside `"scripts"`):
```json
"prisma": {
  "seed": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts"
}
```

- [ ] **Step 2: Create prisma/seed.ts**

```ts
// prisma/seed.ts
import { PrismaClient, StickerSection } from '@prisma/client'

const prisma = new PrismaClient()

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
```

- [ ] **Step 3: Run seed**

```bash
npx prisma db seed
```
Expected: `Seeded 992 stickers`

- [ ] **Step 4: Verify in DB**

```bash
docker compose exec db psql -U copa -d figurinhas -c "SELECT count(*) FROM \"Sticker\";"
```
Expected: `count` = 992.

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: seed 992 stickers (48 nations × 20 + intro + museum + Coca-Cola)"
```

---

### Task 7: Vitest setup

**Files:**
- Create: `vitest.config.ts`
- Create: `__tests__/setup.ts`

- [ ] **Step 1: Create vitest.config.ts**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['__tests__/setup.ts'],
  },
})
```

- [ ] **Step 2: Create __tests__/setup.ts**

```ts
// __tests__/setup.ts
import { vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
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
```

- [ ] **Step 3: Add test script to package.json**

In `"scripts"` add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify vitest runs**

```bash
npm test
```
Expected: `No test files found` (0 tests, no errors).

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts __tests__/setup.ts package.json
git commit -m "chore: configure Vitest with Prisma mock setup"
```

---

## Phase 2 — Authentication

### Task 8: JWT utilities (TDD)

**Files:**
- Create: `lib/jwt.ts`
- Create: `__tests__/lib/jwt.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// __tests__/lib/jwt.test.ts
import { describe, it, expect } from 'vitest'
import { signJwt, verifyJwt } from '@/lib/jwt'

process.env.JWT_SECRET = 'test-secret-32-chars-minimum-pad'

describe('JWT utilities', () => {
  it('signs and verifies a token with the user id', async () => {
    const token = await signJwt({ sub: 'user-123' })
    expect(typeof token).toBe('string')
    const payload = await verifyJwt(token)
    expect(payload.sub).toBe('user-123')
  })

  it('throws when verifying a token with wrong secret', async () => {
    const token = await signJwt({ sub: 'user-123' })
    const badToken = token.slice(0, -4) + 'XXXX'
    await expect(verifyJwt(badToken)).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- __tests__/lib/jwt.test.ts
```
Expected: FAIL — `Cannot find module '@/lib/jwt'`

- [ ] **Step 3: Implement lib/jwt.ts**

```ts
// lib/jwt.ts
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET not set')
  return new TextEncoder().encode(secret)
}

export async function signJwt(payload: { sub: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyJwt(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getSecret())
  return payload
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npm test -- __tests__/lib/jwt.test.ts
```
Expected: PASS — 2 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/jwt.ts __tests__/lib/jwt.test.ts
git commit -m "feat: JWT sign/verify utilities with jose"
```

---

### Task 9: Prisma singleton + getAuthUser helper

**Files:**
- Create: `lib/prisma.ts`
- Create: `lib/auth.ts`

- [ ] **Step 1: Create lib/prisma.ts**

```ts
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 2: Create lib/auth.ts**

```ts
// lib/auth.ts
import { cookies } from 'next/headers'
import { verifyJwt } from './jwt'
import { prisma } from './prisma'

export async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  try {
    const payload = await verifyJwt(token)
    return await prisma.user.findUnique({
      where: { id: payload.sub as string },
      select: { id: true, name: true, email: true, phone: true },
    })
  } catch {
    return null
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/prisma.ts lib/auth.ts
git commit -m "feat: Prisma singleton and getAuthUser cookie helper"
```

---

### Task 10: Zod validation schemas

**Files:**
- Create: `lib/validation/auth.schema.ts`
- Create: `lib/validation/collection.schema.ts`
- Create: `lib/validation/trade.schema.ts`

- [ ] **Step 1: Create auth.schema.ts**

```ts
// lib/validation/auth.schema.ts
import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  phone: z.string().min(8, 'Telefone inválido'),
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
```

- [ ] **Step 2: Create collection.schema.ts**

```ts
// lib/validation/collection.schema.ts
import { z } from 'zod'

export const updateQuantitySchema = z.object({
  quantity: z
    .number()
    .int('Quantidade deve ser inteira')
    .min(1, 'Quantidade mínima é 1')
    .max(99, 'Quantidade máxima é 99'),
})

export type UpdateQuantityInput = z.infer<typeof updateQuantitySchema>
```

- [ ] **Step 3: Create trade.schema.ts**

```ts
// lib/validation/trade.schema.ts
import { z } from 'zod'

export const tradeSearchSchema = z.object({
  stickerId: z.string().min(1, 'ID da figurinha obrigatório'),
})

export type TradeSearchInput = z.infer<typeof tradeSearchSchema>
```

- [ ] **Step 4: Commit**

```bash
git add lib/validation/
git commit -m "feat: Zod schemas for auth, collection, and trade validation"
```

---

### Task 11: Register API route (TDD)

**Files:**
- Create: `app/api/auth/register/route.ts`
- Create: `__tests__/api/auth/register.test.ts`

- [ ] **Step 1: Write failing test**

```ts
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

const mockUser = { id: 'u1', name: 'Ana', email: 'ana@test.com', phone: '11999', password: '' }

beforeEach(() => vi.clearAllMocks())

describe('POST /api/auth/register', () => {
  it('creates a user and returns 201 with token cookie', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any)

    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ana',
        email: 'ana@test.com',
        password: 'senhaforte',
        phone: '11999887766',
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
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)

    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ana',
        email: 'ana@test.com',
        password: 'senhaforte',
        phone: '11999887766',
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
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- __tests__/api/auth/register.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement register route**

```ts
// app/api/auth/register/route.ts
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signJwt } from '@/lib/jwt'
import { registerSchema } from '@/lib/validation/auth.schema'

export async function POST(req: Request) {
  const body = await req.json()
  const result = registerSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const { name, email, password, phone } = result.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, phone },
    select: { id: true, name: true, email: true, phone: true },
  })

  const token = await signJwt({ sub: user.id })

  const res = NextResponse.json({ user }, { status: 201 })
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npm test -- __tests__/api/auth/register.test.ts
```
Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add app/api/auth/register/ __tests__/api/auth/
git commit -m "feat: register API route with Zod validation and JWT cookie"
```

---

### Task 12: Login, Logout, Me API routes

**Files:**
- Create: `app/api/auth/login/route.ts`
- Create: `app/api/auth/logout/route.ts`
- Create: `app/api/auth/me/route.ts`

- [ ] **Step 1: Create login route**

```ts
// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signJwt } from '@/lib/jwt'
import { loginSchema } from '@/lib/validation/auth.schema'

export async function POST(req: Request) {
  const body = await req.json()
  const result = loginSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const { email, password } = result.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
  }

  const token = await signJwt({ sub: user.id })
  const { password: _pw, ...safeUser } = user

  const res = NextResponse.json({ user: safeUser })
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
```

- [ ] **Step 2: Create logout route**

```ts
// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('token', '', { maxAge: 0, path: '/' })
  return res
}
```

- [ ] **Step 3: Create me route**

```ts
// app/api/auth/me/route.ts
import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  return NextResponse.json({ user })
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/auth/login/ app/api/auth/logout/ app/api/auth/me/
git commit -m "feat: login, logout, and me API routes"
```

---

### Task 13: Middleware (JWT page guard)

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Create middleware.ts**

```ts
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJwt } from '@/lib/jwt'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    await verifyJwt(token)
    return NextResponse.next()
  } catch {
    const res = NextResponse.redirect(new URL('/login', request.url))
    res.cookies.set('token', '', { maxAge: 0, path: '/' })
    return res
  }
}

export const config = {
  matcher: ['/collection/:path*', '/trade/:path*'],
}
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: middleware JWT guard for /collection and /trade routes"
```

---

## Phase 3 — Collection

### Task 14: React Query provider

**Files:**
- Create: `components/providers.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create providers.tsx**

```tsx
// components/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000 },
        },
      }),
  )
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

- [ ] **Step 2: Update app/layout.tsx**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'Figurinhas da Copa',
  description: 'Troque figurinhas da Copa do Mundo 2026',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/providers.tsx app/layout.tsx
git commit -m "feat: React Query provider in root layout"
```

---

### Task 15: Base UI primitive components

**Files:**
- Create: `components/ui/button.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/skeleton.tsx`
- Create: `components/ui/dialog.tsx`

- [ ] **Step 1: Create button.tsx**

```tsx
// components/ui/button.tsx
import { Button as BaseButton } from '@base-ui-components/react/button'
import { type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ComponentProps<typeof BaseButton> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-copa-blue text-white hover:bg-copa-blue/90 active:bg-copa-blue/80',
  secondary: 'bg-copa-red text-white hover:bg-copa-red/90 active:bg-copa-red/80',
  ghost: 'bg-transparent text-copa-blue hover:bg-copa-blue/10',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <BaseButton
      className={cn(
        'inline-flex items-center justify-center rounded-md font-inter font-semibold transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copa-blue',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  )
}
```

- [ ] **Step 2: Create lib/utils.ts (cn helper)**

```ts
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Install clsx and tailwind-merge:
```bash
npm install clsx tailwind-merge
```

- [ ] **Step 3: Create input.tsx**

```tsx
// components/ui/input.tsx
import * as Field from '@base-ui-components/react/field'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <Field.Root className="flex flex-col gap-1">
      {label && (
        <Field.Label
          htmlFor={id}
          className="text-sm font-medium text-slate-700"
        >
          {label}
        </Field.Label>
      )}
      <Field.Control
        id={id}
        className={cn(
          'rounded-md border border-slate-300 px-3 py-2 text-sm outline-none',
          'focus:border-copa-blue focus:ring-2 focus:ring-copa-blue/20',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-copa-red focus:border-copa-red focus:ring-copa-red/20',
          className,
        )}
        {...props}
      />
      {error && <Field.Error className="text-xs text-copa-red">{error}</Field.Error>}
    </Field.Root>
  )
}
```

- [ ] **Step 4: Create skeleton.tsx**

```tsx
// components/ui/skeleton.tsx
import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-slate-200', className)} />
}
```

- [ ] **Step 5: Create dialog.tsx**

```tsx
// components/ui/dialog.tsx
'use client'

import * as Dialog from '@base-ui-components/react/dialog'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
}

export function Modal({ open, onOpenChange, title, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
        <Dialog.Popup
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
            'rounded-xl bg-white p-6 shadow-xl',
          )}
        >
          <Dialog.Title className="mb-4 font-bebas text-2xl text-copa-blue">{title}</Dialog.Title>
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add components/ui/ lib/utils.ts package.json package-lock.json
git commit -m "feat: Base UI primitive component wrappers (Button, Input, Skeleton, Modal)"
```

---

### Task 16: useAuth hook + Login page

**Files:**
- Create: `hooks/useAuth.ts`
- Create: `app/(auth)/layout.tsx`
- Create: `app/(auth)/login/page.tsx`

- [ ] **Step 1: Create hooks/useAuth.ts**

```ts
// hooks/useAuth.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  phone: string
}

async function fetchMe(): Promise<User | null> {
  const res = await fetch('/api/auth/me')
  if (!res.ok) return null
  const data = await res.json()
  return data.user
}

export function useAuth() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    retry: false,
  })

  const login = useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Erro ao entrar')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      router.push('/collection')
    },
  })

  const logout = useMutation({
    mutationFn: async () => {
      await fetch('/api/auth/logout', { method: 'POST' })
    },
    onSuccess: () => {
      queryClient.clear()
      router.push('/login')
    },
  })

  return { user, isLoading, login, logout }
}
```

- [ ] **Step 2: Create app/(auth)/layout.tsx**

```tsx
// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-copa-blue px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="font-bebas text-5xl tracking-wider text-copa-blue">
            FIGURINHAS<br />DA COPA
          </h1>
          <p className="mt-1 text-sm text-slate-500">Copa do Mundo 2026</p>
        </div>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create app/(auth)/login/page.tsx**

```tsx
// app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await login.mutateAsync({ email, password })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
        required
      />
      <Input
        id="password"
        label="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />
      {error && <p className="text-sm text-copa-red">{error}</p>}
      <Button type="submit" disabled={login.isPending} className="mt-2 w-full">
        {login.isPending ? 'Entrando...' : 'Entrar'}
      </Button>
      <p className="text-center text-sm text-slate-500">
        Não tem conta?{' '}
        <Link href="/register" className="font-semibold text-copa-blue hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add hooks/useAuth.ts app/\(auth\)/
git commit -m "feat: useAuth hook and login page"
```

---

### Task 17: Register page

**Files:**
- Create: `app/(auth)/register/page.tsx`

- [ ] **Step 1: Create register page**

```tsx
// app/(auth)/register/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro ao cadastrar')
      }
      router.push('/collection')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="name"
        name="name"
        label="Nome completo"
        value={form.name}
        onChange={handleChange}
        placeholder="João Silva"
        required
      />
      <Input
        id="email"
        name="email"
        label="Email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="seu@email.com"
        required
      />
      <Input
        id="phone"
        name="phone"
        label="WhatsApp (com DDD)"
        type="tel"
        value={form.phone}
        onChange={handleChange}
        placeholder="11999887766"
        required
      />
      <Input
        id="password"
        name="password"
        label="Senha"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Mínimo 8 caracteres"
        required
      />
      {error && <p className="text-sm text-copa-red">{error}</p>}
      <Button type="submit" disabled={loading} className="mt-2 w-full">
        {loading ? 'Cadastrando...' : 'Criar conta'}
      </Button>
      <p className="text-center text-sm text-slate-500">
        Já tem conta?{' '}
        <Link href="/login" className="font-semibold text-copa-blue hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(auth\)/register/
git commit -m "feat: register page"
```

---

### Task 18: Stickers API route

**Files:**
- Create: `app/api/stickers/route.ts`

- [ ] **Step 1: Create stickers route**

```ts
// app/api/stickers/route.ts
import { NextResponse } from 'next/server'
import { StickerSection } from '@prisma/client'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const country = searchParams.get('country')
  const search = searchParams.get('search')
  const section = searchParams.get('section')

  const stickers = await prisma.sticker.findMany({
    where: {
      ...(country ? { country } : {}),
      ...(section ? { section: section as StickerSection } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
              { country: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      users: {
        where: { userId: user.id },
        select: { quantity: true },
      },
    },
    orderBy: [{ section: 'asc' }, { country: 'asc' }, { order: 'asc' }],
  })

  const result = stickers.map(({ users, ...s }) => ({
    ...s,
    quantity: users[0]?.quantity ?? null,
  }))

  return NextResponse.json({ stickers: result })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/stickers/
git commit -m "feat: stickers API route with country/search/section filters"
```

---

### Task 19: Collection API routes (TDD)

**Files:**
- Create: `app/api/collection/route.ts`
- Create: `app/api/collection/[stickerId]/route.ts`
- Create: `__tests__/api/collection.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// __tests__/api/collection.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { PUT, DELETE } from '@/app/api/collection/[stickerId]/route'

vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn().mockResolvedValue({ id: 'user-1', name: 'Ana', email: 'a@a.com', phone: '11' }),
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

  it('returns 400 for invalid quantity', async () => {
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
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- __tests__/api/collection.test.ts
```
Expected: FAIL — modules not found.

- [ ] **Step 3: Create collection/route.ts (GET)**

```ts
// app/api/collection/route.ts
import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const userStickers = await prisma.userSticker.findMany({
    where: { userId: user.id },
    include: { sticker: true },
  })

  return NextResponse.json({ userStickers })
}
```

- [ ] **Step 4: Create collection/[stickerId]/route.ts (PUT + DELETE)**

```ts
// app/api/collection/[stickerId]/route.ts
import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateQuantitySchema } from '@/lib/validation/collection.schema'

interface Params {
  params: Promise<{ stickerId: string }>
}

export async function PUT(req: Request, { params }: Params) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { stickerId } = await params
  const body = await req.json()
  const result = updateQuantitySchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const { quantity } = result.data

  const userSticker = await prisma.userSticker.upsert({
    where: { userId_stickerId: { userId: user.id, stickerId } },
    create: { userId: user.id, stickerId, quantity },
    update: { quantity },
  })

  return NextResponse.json({ userSticker })
}

export async function DELETE(req: Request, { params }: Params) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { stickerId } = await params

  await prisma.userSticker.delete({
    where: { userId_stickerId: { userId: user.id, stickerId } },
  })

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm test -- __tests__/api/collection.test.ts
```
Expected: PASS — 3 tests.

- [ ] **Step 6: Commit**

```bash
git add app/api/collection/ __tests__/api/collection.test.ts
git commit -m "feat: collection API routes (GET, PUT, DELETE) with TDD"
```

---

### Task 20: StickerCard + QuantityInput

**Files:**
- Create: `components/features/StickerCard.tsx`
- Create: `components/features/QuantityInput.tsx`

- [ ] **Step 1: Create QuantityInput.tsx**

```tsx
// components/features/QuantityInput.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'

interface QuantityInputProps {
  stickerId: string
  currentQuantity: number
  onSave: (stickerId: string, quantity: number) => void
  onRemove: (stickerId: string) => void
}

export function QuantityInput({ stickerId, currentQuantity, onSave, onRemove }: QuantityInputProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(currentQuantity)
  const duplicates = currentQuantity - 1

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-copa-gold px-2 py-0.5 text-xs font-bold text-copa-blue"
        title="Editar repetidas"
      >
        {duplicates > 0 ? `${duplicates}x` : 'Rep.'}
      </button>
      <Modal open={open} onOpenChange={setOpen} title="Quantas você tem?">
        <p className="mb-4 text-sm text-slate-600">
          Informe quantas cópias desta figurinha você tem no total.
        </p>
        <div className="mb-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setValue((v) => Math.max(1, v - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-copa-blue text-copa-blue text-xl font-bold hover:bg-copa-blue/10"
          >
            −
          </button>
          <span className="font-bebas text-5xl text-copa-blue">{value}</span>
          <button
            onClick={() => setValue((v) => Math.min(99, v + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-copa-blue text-copa-blue text-xl font-bold hover:bg-copa-blue/10"
          >
            +
          </button>
        </div>
        {value > 1 && (
          <p className="mb-4 text-center text-sm text-slate-500">
            {value - 1} repetida{value - 1 > 1 ? 's' : ''} disponível para troca
          </p>
        )}
        <div className="flex gap-2">
          <Button onClick={() => { onSave(stickerId, value); setOpen(false) }} className="flex-1">
            Salvar
          </Button>
          <Button
            variant="ghost"
            onClick={() => { onRemove(stickerId); setOpen(false) }}
            className="flex-1 text-slate-500"
          >
            Não tenho
          </Button>
        </div>
      </Modal>
    </>
  )
}
```

- [ ] **Step 2: Create StickerCard.tsx**

```tsx
// components/features/StickerCard.tsx
'use client'

import { cn } from '@/lib/utils'
import { QuantityInput } from './QuantityInput'

interface Sticker {
  id: string
  code: string
  name: string
  isFoil: boolean
  quantity: number | null
}

interface StickerCardProps {
  sticker: Sticker
  onToggleOwned: (stickerId: string) => void
  onUpdateQuantity: (stickerId: string, quantity: number) => void
  onRemove: (stickerId: string) => void
}

export function StickerCard({ sticker, onToggleOwned, onUpdateQuantity, onRemove }: StickerCardProps) {
  const owned = sticker.quantity !== null
  const hasDuplicate = (sticker.quantity ?? 0) > 1

  return (
    <div
      className={cn(
        'relative flex flex-col items-center rounded-lg border-2 p-2 transition-all',
        owned
          ? hasDuplicate
            ? 'border-copa-gold bg-copa-gold/10'
            : 'border-copa-blue bg-copa-blue/5'
          : 'border-slate-200 bg-white opacity-60',
        sticker.isFoil && owned && 'shadow-[0_0_8px_2px_rgba(245,197,24,0.5)]',
      )}
    >
      <button
        onClick={() => onToggleOwned(sticker.id)}
        className="flex w-full flex-col items-center gap-1 focus:outline-none"
        title={owned ? 'Marcar como não tenho' : 'Marcar como tenho'}
      >
        <span
          className={cn(
            'font-bebas text-xl leading-none',
            owned ? 'text-copa-blue' : 'text-slate-400',
            sticker.isFoil && 'text-copa-gold',
          )}
        >
          {sticker.code}
        </span>
        <span className="line-clamp-2 text-center text-[10px] leading-tight text-slate-500">
          {sticker.name}
        </span>
        {owned && (
          <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-copa-blue">
            <span className="text-[10px] text-white">✓</span>
          </div>
        )}
      </button>
      {owned && (
        <div className="mt-1">
          <QuantityInput
            stickerId={sticker.id}
            currentQuantity={sticker.quantity!}
            onSave={onUpdateQuantity}
            onRemove={onRemove}
          />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/features/StickerCard.tsx components/features/QuantityInput.tsx
git commit -m "feat: StickerCard and QuantityInput components"
```

---

### Task 21: StickerGrid + CountryFilter + SearchBar + Skeletons

**Files:**
- Create: `components/features/CountryFilter.tsx`
- Create: `components/features/SearchBar.tsx`
- Create: `components/features/StickerGridSkeleton.tsx`
- Create: `components/features/StickerGrid.tsx`

- [ ] **Step 1: Create CountryFilter.tsx**

```tsx
// components/features/CountryFilter.tsx
'use client'

import { cn } from '@/lib/utils'

interface CountryFilterProps {
  countries: string[]
  selected: string | null
  onChange: (country: string | null) => void
}

export function CountryFilter({ countries, selected, onChange }: CountryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onChange(null)}
        className={cn(
          'shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors',
          selected === null
            ? 'bg-copa-blue text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
        )}
      >
        Todas
      </button>
      {countries.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={cn(
            'shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors',
            selected === c
              ? 'bg-copa-blue text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
          )}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create SearchBar.tsx**

```tsx
// components/features/SearchBar.tsx
'use client'

import { useEffect, useRef, useState } from 'react'

interface SearchBarProps {
  placeholder: string
  onSearch: (value: string) => void
  debounceMs?: number
}

export function SearchBar({ placeholder, onSearch, debounceMs = 300 }: SearchBarProps) {
  const [value, setValue] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSearch(value), debounceMs)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [value, debounceMs, onSearch])

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-copa-blue focus:ring-2 focus:ring-copa-blue/20"
      />
    </div>
  )
}
```

- [ ] **Step 3: Create StickerGridSkeleton.tsx**

```tsx
// components/features/StickerGridSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton'

export function StickerGridSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-8 w-2/3" />
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {Array.from({ length: 40 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create StickerGrid.tsx**

Note: `countries` must come from an unfiltered query so the filter chips persist when a country is selected. We use two `useStickers` calls — React Query caches the unfiltered one after the first fetch.

```tsx
// components/features/StickerGrid.tsx
'use client'

import { useCallback, useState } from 'react'
import { useStickers } from '@/hooks/useStickers'
import { useCollection } from '@/hooks/useCollection'
import { StickerCard } from './StickerCard'
import { CountryFilter } from './CountryFilter'
import { SearchBar } from './SearchBar'

export function StickerGrid() {
  const [country, setCountry] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const { stickers, isLoading } = useStickers({ country, search })
  const { countries } = useStickers() // unfiltered — for the persistent filter chips
  const { toggleOwned, updateQuantity, removeSticker } = useCollection()

  const handleSearch = useCallback((v: string) => setSearch(v), [])

  const grouped = stickers.reduce<Record<string, typeof stickers>>(
    (acc, s) => ({ ...acc, [s.country]: [...(acc[s.country] ?? []), s] }),
    {},
  )

  if (isLoading) return null

  return (
    <div className="space-y-4">
      <SearchBar
        placeholder="Pesquisar figurinha por nome, código ou país..."
        onSearch={handleSearch}
      />
      <CountryFilter countries={countries} selected={country} onChange={setCountry} />
      {Object.entries(grouped).map(([countryName, group]) => (
        <section key={countryName}>
          <h2 className="mb-2 font-bebas text-2xl text-copa-blue">{countryName}</h2>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
            {group.map((sticker) => (
              <StickerCard
                key={sticker.id}
                sticker={sticker}
                onToggleOwned={toggleOwned}
                onUpdateQuantity={updateQuantity}
                onRemove={removeSticker}
              />
            ))}
          </div>
        </section>
      ))}
      {stickers.length === 0 && (
        <p className="py-12 text-center text-slate-500">Nenhuma figurinha encontrada.</p>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add components/features/CountryFilter.tsx components/features/SearchBar.tsx components/features/StickerGridSkeleton.tsx components/features/StickerGrid.tsx
git commit -m "feat: StickerGrid, CountryFilter, SearchBar, and skeleton components"
```

---

### Task 22: useStickers + useCollection hooks

**Files:**
- Create: `hooks/useStickers.ts`
- Create: `hooks/useCollection.ts`

- [ ] **Step 1: Create hooks/useStickers.ts**

```ts
// hooks/useStickers.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

interface Sticker {
  id: string
  code: string
  name: string
  country: string
  section: string
  isFoil: boolean
  quantity: number | null
}

interface UseStickersParams {
  country?: string | null
  search?: string
}

export function useStickers({ country, search }: UseStickersParams = {}) {
  const params = new URLSearchParams()
  if (country) params.set('country', country)
  if (search) params.set('search', search)

  const { data, isLoading } = useQuery<{ stickers: Sticker[] }>({
    queryKey: ['stickers', { country, search }],
    queryFn: () => fetch(`/api/stickers?${params}`).then((r) => r.json()),
  })

  const stickers = data?.stickers ?? []

  const countries = useMemo(
    () => Array.from(new Set(stickers.filter((s) => s.section === 'country').map((s) => s.country))),
    [stickers],
  )

  return { stickers, countries, isLoading }
}
```

- [ ] **Step 2: Create hooks/useCollection.ts**

```ts
// hooks/useCollection.ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useCollection() {
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['stickers'] })

  const updateSticker = useMutation({
    mutationFn: async ({ stickerId, quantity }: { stickerId: string; quantity: number }) => {
      const res = await fetch(`/api/collection/${stickerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })
      if (!res.ok) throw new Error('Erro ao atualizar figurinha')
    },
    onSuccess: invalidate,
  })

  const removeSticker = useMutation({
    mutationFn: async (stickerId: string) => {
      const res = await fetch(`/api/collection/${stickerId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao remover figurinha')
    },
    onSuccess: invalidate,
  })

  function toggleOwned(stickerId: string) {
    updateSticker.mutate({ stickerId, quantity: 1 })
  }

  function updateQuantity(stickerId: string, quantity: number) {
    if (quantity === 0) {
      removeSticker.mutate(stickerId)
    } else {
      updateSticker.mutate({ stickerId, quantity })
    }
  }

  function removeFromCollection(stickerId: string) {
    removeSticker.mutate(stickerId)
  }

  return { toggleOwned, updateQuantity, removeSticker: removeFromCollection }
}
```

- [ ] **Step 3: Commit**

```bash
git add hooks/useStickers.ts hooks/useCollection.ts
git commit -m "feat: useStickers and useCollection hooks with React Query"
```

---

### Task 23: Collection page + App layout + root redirect

**Files:**
- Create: `app/(app)/layout.tsx`
- Create: `app/(app)/collection/page.tsx`
- Create: `app/(app)/collection/loading.tsx`
- Create: `app/page.tsx`

- [ ] **Step 1: Create app/(app)/layout.tsx**

```tsx
// app/(app)/layout.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/collection', label: 'Minha coleção' },
  { href: '/trade', label: 'Trocar figurinhas' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-copa-blue shadow-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <span className="font-bebas text-2xl tracking-widest text-white">
            FIGURINHAS DA COPA
          </span>
          <nav className="flex items-center gap-4">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  pathname === n.href ? 'text-copa-gold' : 'text-white/80 hover:text-white',
                )}
              >
                {n.label}
              </Link>
            ))}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout.mutate()}
                className="text-white/80 hover:text-white"
              >
                Sair
              </Button>
            )}
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
```

- [ ] **Step 2: Create collection/page.tsx**

```tsx
// app/(app)/collection/page.tsx
import { Suspense } from 'react'
import { StickerGrid } from '@/components/features/StickerGrid'
import { StickerGridSkeleton } from '@/components/features/StickerGridSkeleton'

export default function CollectionPage() {
  return (
    <div>
      <h1 className="mb-6 font-bebas text-4xl text-copa-blue">Minha Coleção</h1>
      <Suspense fallback={<StickerGridSkeleton />}>
        <StickerGrid />
      </Suspense>
    </div>
  )
}
```

- [ ] **Step 3: Create collection/loading.tsx**

```tsx
// app/(app)/collection/loading.tsx
import { StickerGridSkeleton } from '@/components/features/StickerGridSkeleton'

export default function Loading() {
  return <StickerGridSkeleton />
}
```

- [ ] **Step 4: Create root redirect page**

```tsx
// app/page.tsx
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'

export default async function RootPage() {
  const user = await getAuthUser()
  redirect(user ? '/collection' : '/login')
}
```

- [ ] **Step 5: Commit**

```bash
git add app/\(app\)/layout.tsx app/\(app\)/collection/ app/page.tsx
git commit -m "feat: app layout with nav, collection page with Suspense, root redirect"
```

---

## Phase 4 — Trade

### Task 24: Trade API route (TDD)

**Files:**
- Create: `app/api/trade/search/route.ts`
- Create: `__tests__/api/trade.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// __tests__/api/trade.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { GET } from '@/app/api/trade/search/route'

vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn().mockResolvedValue({ id: 'user-1', name: 'Ana', email: 'a@a.com', phone: '11' }),
}))

beforeEach(() => vi.clearAllMocks())

describe('GET /api/trade/search', () => {
  it('returns 400 when stickerId is missing', async () => {
    const req = new Request('http://localhost/api/trade/search')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns trading partners who have the sticker as duplicate', async () => {
    vi.mocked(prisma.userSticker.findMany).mockResolvedValueOnce([
      {
        userId: 'user-2',
        stickerId: 'sticker-abc',
        quantity: 3,
        id: 'us1',
        user: { id: 'user-2', name: 'Carlos', phone: '21999', email: 'c@c.com' } as any,
      } as any,
    ])
    vi.mocked(prisma.userSticker.findMany).mockResolvedValueOnce([
      { stickerId: 'sticker-xyz', quantity: 2, id: 'us2', userId: 'user-1', sticker: { id: 'sticker-xyz', code: 'BRA3', name: 'Jogador 3', country: 'Brasil', section: 'country', isFoil: false, order: 3 } } as any,
    ])
    vi.mocked(prisma.userSticker.findMany).mockResolvedValueOnce([
      { stickerId: 'sticker-xyz', quantity: 1, id: 'us3', userId: 'user-2' } as any,
    ])

    const req = new Request('http://localhost/api/trade/search?stickerId=sticker-abc')
    const res = await GET(req)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.partners).toHaveLength(1)
    expect(body.partners[0].name).toBe('Carlos')
    expect(body.partners[0].duplicatesAvailable).toBe(2)
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- __tests__/api/trade.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement trade/search/route.ts**

```ts
// app/api/trade/search/route.ts
import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { tradeSearchSchema } from '@/lib/validation/trade.schema'

export async function GET(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const result = tradeSearchSchema.safeParse({ stickerId: searchParams.get('stickerId') })
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const { stickerId } = result.data

  // Users who have this sticker as duplicate (quantity >= 2), excluding current user
  const duplicateOwners = await prisma.userSticker.findMany({
    where: {
      stickerId,
      quantity: { gte: 2 },
      userId: { not: user.id },
    },
    include: {
      user: { select: { id: true, name: true, phone: true, email: true } },
    },
  })

  if (duplicateOwners.length === 0) {
    return NextResponse.json({ partners: [] })
  }

  // My stickers with duplicates (quantity >= 2)
  const myDuplicates = await prisma.userSticker.findMany({
    where: { userId: user.id, quantity: { gte: 2 } },
    include: { sticker: true },
  })

  const partnerIds = duplicateOwners.map((o) => o.userId)

  // For each partner: stickers they DON'T have that I have as duplicate
  const partnersCollection = await prisma.userSticker.findMany({
    where: { userId: { in: partnerIds } },
    select: { userId: true, stickerId: true },
  })

  const partnerHasSet = new Map<string, Set<string>>()
  for (const p of partnersCollection) {
    if (!partnerHasSet.has(p.userId)) partnerHasSet.set(p.userId, new Set())
    partnerHasSet.get(p.userId)!.add(p.stickerId)
  }

  const partners = duplicateOwners.map((owner) => {
    const theyHave = partnerHasSet.get(owner.userId) ?? new Set()
    const theyNeedFromYou = myDuplicates
      .filter((d) => !theyHave.has(d.stickerId))
      .map((d) => d.sticker)
      .slice(0, 5)

    return {
      userId: owner.user.id,
      name: owner.user.name,
      phone: owner.user.phone,
      duplicatesAvailable: owner.quantity - 1,
      theyNeedFromYou,
    }
  })

  return NextResponse.json({ partners })
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- __tests__/api/trade.test.ts
```
Expected: PASS — 2 tests.

- [ ] **Step 5: Commit**

```bash
git add app/api/trade/ __tests__/api/trade.test.ts
git commit -m "feat: trade search API route with match logic (TDD)"
```

---

### Task 25: WhatsApp helper + TradingPartnerCard

**Files:**
- Create: `lib/whatsapp.ts`
- Create: `components/features/TradingPartnerCard.tsx`

- [ ] **Step 1: Create lib/whatsapp.ts**

```ts
// lib/whatsapp.ts
interface Sticker {
  code: string
  name: string
}

export function buildWhatsAppUrl(phone: string, sticker: Sticker): string {
  const cleanPhone = phone.replace(/\D/g, '')
  const message = encodeURIComponent(
    `Oi! Vi que você tem a figurinha ${sticker.code} (${sticker.name}) repetida no Figurinhas da Copa. Quer trocar?`,
  )
  return `https://wa.me/55${cleanPhone}?text=${message}`
}
```

- [ ] **Step 2: Create TradingPartnerCard.tsx**

```tsx
// components/features/TradingPartnerCard.tsx
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { Button } from '@/components/ui/button'

interface Sticker {
  id: string
  code: string
  name: string
}

interface TradingPartner {
  userId: string
  name: string
  phone: string
  duplicatesAvailable: number
  theyNeedFromYou: Sticker[]
}

interface TradingPartnerCardProps {
  partner: TradingPartner
  searchedSticker: Sticker
}

export function TradingPartnerCard({ partner, searchedSticker }: TradingPartnerCardProps) {
  const waUrl = buildWhatsAppUrl(partner.phone, searchedSticker)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-800">{partner.name}</p>
          <span className="mt-1 inline-block rounded-full bg-copa-gold/20 px-2 py-0.5 text-xs font-medium text-copa-blue">
            Tem {partner.duplicatesAvailable} repetida{partner.duplicatesAvailable > 1 ? 's' : ''}
          </span>
        </div>
        <a href={waUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary" size="sm">
            💬 WhatsApp
          </Button>
        </a>
      </div>
      {partner.theyNeedFromYou.length > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500 mb-1">
            Precisa de {partner.theyNeedFromYou.length} figurinha
            {partner.theyNeedFromYou.length > 1 ? 's' : ''} que você tem repetida:
          </p>
          <div className="flex flex-wrap gap-1">
            {partner.theyNeedFromYou.map((s) => (
              <span
                key={s.id}
                className="rounded-full bg-copa-blue/10 px-2 py-0.5 text-xs font-mono font-semibold text-copa-blue"
              >
                {s.code}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/whatsapp.ts components/features/TradingPartnerCard.tsx
git commit -m "feat: WhatsApp URL builder and TradingPartnerCard component"
```

---

### Task 26: useTrade hook + Trade page + final build

**Files:**
- Create: `hooks/useTrade.ts`
- Create: `app/(app)/trade/page.tsx`
- Create: `app/(app)/trade/loading.tsx`

- [ ] **Step 1: Create hooks/useTrade.ts**

```ts
// hooks/useTrade.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

interface Sticker {
  id: string
  code: string
  name: string
}

interface TradingPartner {
  userId: string
  name: string
  phone: string
  duplicatesAvailable: number
  theyNeedFromYou: Sticker[]
}

export function useTrade(stickerId: string | null) {
  const { data, isLoading } = useQuery<{ partners: TradingPartner[] }>({
    queryKey: ['trade', stickerId],
    queryFn: () => fetch(`/api/trade/search?stickerId=${stickerId}`).then((r) => r.json()),
    enabled: !!stickerId,
  })

  return { partners: data?.partners ?? [], isLoading }
}
```

- [ ] **Step 2: Create trade/page.tsx**

```tsx
// app/(app)/trade/page.tsx
'use client'

import { useState, useCallback } from 'react'
import { Suspense } from 'react'
import { SearchBar } from '@/components/features/SearchBar'
import { TradingPartnerCard } from '@/components/features/TradingPartnerCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useStickers } from '@/hooks/useStickers'
import { useTrade } from '@/hooks/useTrade'

function TradeResults({
  stickerId,
  sticker,
}: {
  stickerId: string
  sticker: { id: string; code: string; name: string }
}) {
  const { partners, isLoading } = useTrade(stickerId)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (partners.length === 0) {
    return (
      <p className="py-8 text-center text-slate-500">
        Nenhum usuário tem esta figurinha como repetida no momento.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {partners.map((p) => (
        <TradingPartnerCard key={p.userId} partner={p} searchedSticker={sticker} />
      ))}
    </div>
  )
}

export default function TradePage() {
  const [search, setSearch] = useState('')
  const [selectedSticker, setSelectedSticker] = useState<{
    id: string
    code: string
    name: string
  } | null>(null)

  const { stickers } = useStickers({ search })

  const handleSearch = useCallback((v: string) => {
    setSearch(v)
    setSelectedSticker(null)
  }, [])

  const matchingStickers = search.trim().length > 0 ? stickers.slice(0, 10) : []

  return (
    <div>
      <h1 className="mb-2 font-bebas text-4xl text-copa-blue">Trocar Figurinhas</h1>
      <p className="mb-6 text-sm text-slate-500">
        Busque uma figurinha que você precisa e veja quem tem repetida.
      </p>

      <div className="mb-4">
        <SearchBar
          placeholder="Buscar figurinha por nome, código ou país..."
          onSearch={handleSearch}
        />
      </div>

      {matchingStickers.length > 0 && !selectedSticker && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {matchingStickers.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSticker(s)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0"
            >
              <span className="font-bebas text-lg text-copa-blue w-16 shrink-0">{s.code}</span>
              <span className="text-sm text-slate-700">{s.name}</span>
              <span className="ml-auto text-xs text-slate-400">{s.country}</span>
            </button>
          ))}
        </div>
      )}

      {selectedSticker && (
        <div>
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-copa-blue/10 p-3">
            <span className="font-bebas text-2xl text-copa-blue">{selectedSticker.code}</span>
            <span className="text-sm font-medium text-slate-700">{selectedSticker.name}</span>
            <button
              onClick={() => setSelectedSticker(null)}
              className="ml-auto text-xs text-slate-400 hover:text-slate-600"
            >
              ✕ Mudar
            </button>
          </div>
          <Suspense
            fallback={
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            }
          >
            <TradeResults stickerId={selectedSticker.id} sticker={selectedSticker} />
          </Suspense>
        </div>
      )}

      {!selectedSticker && search.trim().length === 0 && (
        <p className="py-12 text-center text-slate-400">
          Digite o nome ou código de uma figurinha para começar.
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create trade/loading.tsx**

```tsx
// app/(app)/trade/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-12 w-full" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run all tests**

```bash
npm test
```
Expected: all tests pass.

- [ ] **Step 5: Run lint**

```bash
npm run lint
```
Expected: No errors.

- [ ] **Step 6: Run build**

```bash
npm run build
```
Expected: Build completes successfully with no TypeScript errors.

- [ ] **Step 7: Smoke test manually**

```bash
npm run dev
```

1. Open http://localhost:3000 → redirects to `/login`
2. Go to `/register` → create account with name, email, phone, password
3. Redirected to `/collection` — sticker grid loads
4. Click a sticker → gets checkmark (owned)
5. Click the "Rep." badge → modal opens → set quantity to 3 → save
6. Gold badge shows "2x"
7. Go to `/trade` → search "BRA" → sticker list appears
8. Click a sticker → shows "Nenhum usuário..." message (expected — only one test user)
9. Click "Sair" → redirected to `/login`

- [ ] **Step 8: Commit**

```bash
git add hooks/useTrade.ts app/\(app\)/trade/
git commit -m "feat: useTrade hook and trade page with partner search and WhatsApp CTA"
```

---

## Verification Checklist

- [ ] `docker compose up -d` → PostgreSQL running
- [ ] `npx prisma migrate dev` → schema applied
- [ ] `npx prisma db seed` → 992 stickers seeded
- [ ] `npm test` → all tests green
- [ ] `npm run lint` → no errors
- [ ] `npm run build` → compiles cleanly
- [ ] Register → login → mark stickers → trade search → WhatsApp link opens correctly
