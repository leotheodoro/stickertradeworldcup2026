# Figurinhas da Copa — Design Spec

**Date:** 2026-05-02
**Status:** Approved

---

## Context

An app for Brazilian sticker collectors to manage their 2026 Panini FIFA World Cup album and find trading partners. Users mark which stickers they own and how many duplicates they have, then search for people willing to trade, initiating contact via WhatsApp.

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database ORM | Prisma + PostgreSQL |
| Local DB | Docker Compose |
| Auth | Custom JWT with `jose`, httpOnly cookie |
| Password hashing | `bcryptjs` |
| Styling | Tailwind CSS |
| Primitive components | `@base-ui-components/react` |
| Client data fetching | `@tanstack/react-query` |
| Validation | Zod (API + forms) |
| Code quality | ESLint + Prettier |
| Language | pt-BR — all UI copy and WhatsApp messages in Brazilian Portuguese |

---

## Visual Identity

Aligned with FIFA World Cup 2026 branding.

- **Colors:**
  - `#002868` — FIFA Blue (primary)
  - `#BF0A30` — FIFA Red (accent/CTA)
  - `#FFFFFF` — White (background/text)
  - `#F5C518` — Gold (highlights, foil stickers)
- **Fonts:**
  - `Bebas Neue` (Google Fonts) — headings, sticker codes, numbers
  - `Inter` — body text, labels
- **Motifs:** Bold sticker code displays, country flag emojis, trophy silhouette in the header logo
- **Loading states:** Base UI skeleton primitives + Tailwind `animate-pulse`, wrapped in React `<Suspense>`

---

## Project Structure

```
figurinhasdacopa/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   └── me/route.ts
│   │   ├── stickers/route.ts
│   │   ├── collection/
│   │   │   └── [stickerId]/route.ts
│   │   └── trade/
│   │       └── search/route.ts
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx           ← authenticated layout with nav
│   │   ├── collection/page.tsx
│   │   └── trade/page.tsx
│   └── layout.tsx               ← root layout (fonts, QueryClientProvider)
├── components/
│   ├── ui/                      ← Base UI wrappers (Button, Input, Dialog, etc.)
│   └── features/
│       ├── StickerCard.tsx
│       ├── StickerGrid.tsx
│       ├── CountryFilter.tsx
│       ├── QuantityInput.tsx
│       ├── SearchBar.tsx
│       └── TradingPartnerCard.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useCollection.ts
│   ├── useStickers.ts
│   └── useTrade.ts
├── lib/
│   ├── prisma.ts                ← Prisma client singleton
│   ├── jwt.ts                   ← sign/verify helpers using jose
│   ├── auth.ts                  ← getAuthUser() from request cookies
│   └── validation/
│       ├── auth.schema.ts       ← Zod schemas for register/login
│       ├── collection.schema.ts ← Zod schemas for collection mutations
│       └── trade.schema.ts      ← Zod schemas for trade search
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                  ← Seeds all 1,012 stickers
├── middleware.ts                 ← JWT guard: redirects unauthenticated users
├── docker-compose.yml
├── .env.example
└── tailwind.config.ts
```

---

## Data Models

```prisma
model User {
  id        String        @id @default(cuid())
  name      String
  email     String        @unique
  password  String        // bcrypt hash
  phone     String
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  stickers  UserSticker[]
}

model Sticker {
  id      String          @id @default(cuid())
  code    String          @unique   // e.g. "MEX1", "ARG5", "INTRO1"
  name    String                    // e.g. "Hirving Lozano"
  country String                    // e.g. "Mexico", "Intro", "FIFA Museum"
  section StickerSection
  isFoil  Boolean         @default(false)
  order   Int                       // sort order within section/country
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
  // quantity = 1  → owned, no duplicates
  // quantity >= 2 → owned, (quantity - 1) duplicates available for trade
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  sticker   Sticker  @relation(fields: [stickerId], references: [id])
  @@unique([userId, stickerId])
}
```

**Seeding:** `prisma/seed.ts` inserts all 1,012 stickers (48 nations × 20 + 9 intro + 11 museum + 12 Coca-Cola). Each country sticker has `isFoil = true` for position 1 (team logo).

---

## API Routes

### Auth

| Method | Route | Auth | Body (Zod) | Description |
|---|---|---|---|---|
| POST | `/api/auth/register` | ✗ | `{ name, email, password, phone }` | Create user, set JWT cookie |
| POST | `/api/auth/login` | ✗ | `{ email, password }` | Verify credentials, set JWT cookie |
| POST | `/api/auth/logout` | ✓ | — | Clear JWT cookie |
| GET | `/api/auth/me` | ✓ | — | Return current user (no password) |

### Stickers

| Method | Route | Auth | Query params | Description |
|---|---|---|---|---|
| GET | `/api/stickers` | ✓ | `country`, `search`, `section` | List stickers; includes caller's quantity if owned |

### Collection

| Method | Route | Auth | Body (Zod) | Description |
|---|---|---|---|---|
| GET | `/api/collection` | ✓ | — | All UserSticker rows for current user |
| PUT | `/api/collection/:stickerId` | ✓ | `{ quantity: number (min 1) }` | Upsert ownership / duplicate count |
| DELETE | `/api/collection/:stickerId` | ✓ | — | Remove sticker from collection |

### Trade

| Method | Route | Auth | Query params | Description |
|---|---|---|---|---|
| GET | `/api/trade/search` | ✓ | `stickerId` (required) | Trading partners who have duplicate of this sticker |

**Trade search response per partner:**
```ts
{
  userId: string
  name: string
  phone: string          // used to build wa.me link
  duplicatesAvailable: number   // quantity - 1
  theyNeedFromYou: Sticker[]    // stickers they don't have that you have as duplicate
}
```

---

## Authentication Flow

1. **Register/Login** → Zod validates body → bcrypt verify/hash → `jose` signs `{ sub: userId }` JWT (7-day expiry) → set `token` httpOnly, Secure, SameSite=Lax cookie → return user profile
2. **`middleware.ts`** → runs on all `/(app)/*` routes → reads `token` cookie → verifies with `jose` → redirects to `/login` on failure
3. **`lib/auth.ts`** → `getAuthUser(req)` helper used in every Route Handler → verifies JWT → returns user or throws 401
4. **Client** → `useAuth` hook calls `GET /api/auth/me` via React Query → cached, auto-invalidated on logout

---

## Pages & UX

### `/collection`

All copy in pt-BR. Examples: "Todas", "Pesquisar figurinha...", "Tenho", "Repetida", "Salvar".

- **Top bar:** search input ("Pesquisar figurinha...") + country filter chips (scrollable, one per nation + "Todas")
- **Sticker grid:** grouped by country, each group has a header with flag emoji + country name
- **StickerCard states:**
  - Not owned: greyed out, click → owned (quantity=1) — tooltip "Marcar como tenho"
  - Owned: green checkmark, duplicate button visible — label "Tenho"
  - Has duplicates: gold badge with count ("X repetidas"), click badge to edit count
- **Suspense skeleton:** `StickerGrid` wrapped in `<Suspense fallback={<StickerGridSkeleton />}>`
- **Optimistic updates:** React Query `useMutation` with `onMutate` to update the cache immediately

### `/trade`

All copy in pt-BR. Examples: "Buscar figurinha...", "Tem X repetidas", "Ele precisa de Y figurinhas que você tem repetidas", "Conversar no WhatsApp".

- **Search bar:** "Buscar figurinha por nome, código ou país..."
- **Results:** list of `TradingPartnerCard` per user who has the searched sticker as duplicate
- **TradingPartnerCard:**
  - User name
  - "Tem X repetidas" badge
  - Match section: "Ele/Ela precisa de Y figurinhas que você tem repetidas" → list up to 3 sticker codes
  - "Conversar no WhatsApp" button → `https://wa.me/{phone}?text=...` (pre-filled message)
- **Pre-filled WhatsApp message (pt-BR):** `Oi! Vi que você tem a figurinha {code} ({name}) repetida no Figurinhas da Copa. Quer trocar?`

---

## Reusable Components

| Component | Primitive (Base UI) | Purpose |
|---|---|---|
| `Button` | `@base-ui/Button` | All CTAs |
| `Input` | `@base-ui/Input` | Text inputs |
| `Dialog` | `@base-ui/Dialog` | Quantity edit modal |
| `Tooltip` | `@base-ui/Tooltip` | Sticker name on hover |
| `Skeleton` | Tailwind div | Loading placeholders |
| `StickerCard` | — | Sticker state display |
| `CountryFilter` | — | Filter chip list |
| `QuantityInput` | — | Stepper for duplicate count |
| `TradingPartnerCard` | — | Trade partner display |
| `SearchBar` | — | Debounced sticker search |

---

## Hooks

| Hook | React Query key | Description |
|---|---|---|
| `useAuth` | `['auth', 'me']` | Current user, login/logout mutations |
| `useStickers` | `['stickers', filters]` | Sticker list with country/search filters |
| `useCollection` | `['collection']` | Current user's sticker quantities |
| `useUpdateSticker` | — | Mutation to set quantity (optimistic) |
| `useTrade` | `['trade', stickerId]` | Trading partners for a sticker |

---

## Docker Compose

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: copa
      POSTGRES_PASSWORD: copa
      POSTGRES_DB: figurinhas
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

`.env.example`:
```
DATABASE_URL="postgresql://copa:copa@localhost:5432/figurinhas"
JWT_SECRET="change-me-in-production"
```

---

## Validation (Zod)

All Route Handler bodies and query params are validated via Zod schemas in `lib/validation/`. Client-side forms use the same schemas with `zod` directly (no react-hook-form, keeping deps lean).

```ts
// auth.schema.ts
export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(8),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// collection.schema.ts
export const updateQuantitySchema = z.object({
  quantity: z.number().int().min(1).max(99),
})
```

---

## Verification Plan

1. `docker compose up -d` → PostgreSQL starts on port 5432
2. `npx prisma migrate dev` → schema applied
3. `npx prisma db seed` → 1,012 stickers seeded
4. `npm run dev` → app runs on localhost:3000
5. Register a user → JWT cookie set, redirected to `/collection`
6. Mark 5 stickers as owned, 2 as duplicates
7. Register a second user → mark different stickers as owned with duplicates
8. On user 1: go to `/trade`, search for a sticker user 2 has as duplicate → TradingPartnerCard appears with WhatsApp link
9. Click "Conversar no WhatsApp" → pre-filled pt-BR message with sticker code and name
10. Run `npm run lint` and `npm run build` with zero errors
