// app/(app)/layout.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/collection', label: 'Minha coleção' },
  { href: '/match', label: 'Com quem trocar?' },
  { href: '/trade', label: 'Trocar figurinhas' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden border-b border-white/10 bg-[#041437] text-white shadow-[0_24px_64px_rgba(4,20,55,0.36)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,197,24,0.22),transparent_24%),radial-gradient(circle_at_top_right,rgba(191,10,48,0.22),transparent_28%),linear-gradient(135deg,#041437_0%,#06235b_55%,#0a3c88_100%)]" />
        <div className="pointer-events-none absolute left-[-7rem] top-[-6rem] h-44 w-44 rounded-full bg-[#f5c518]/18 blur-3xl" />
        <div className="pointer-events-none absolute right-[-9rem] top-[-4rem] h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-6rem] right-[14%] h-40 w-40 rounded-full bg-[#bf0a30]/14 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/collection" className="flex items-center gap-4">
              <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.22)] backdrop-blur">
                <Image
                  src="/brand/world-cup-2026-emblem.svg"
                  alt="Emblema da Copa do Mundo FIFA 2026"
                  width={64}
                  height={64}
                  unoptimized
                  className="h-16 w-16 object-contain"
                />
              </div>
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.34em] text-white/60">
                  FIFA World Cup 26
                </p>
                <h1 className="text-2xl font-semibold tracking-[0.12em] text-white sm:text-3xl">
                  Figurinhas da Copa
                </h1>
                <p className="mt-1 text-sm text-white/[0.72]">
                  Colecione, marque repetidas e encontre trocas na ordem do álbum Panini.
                </p>
              </div>
            </Link>

            <div className="flex flex-col gap-3 lg:items-end">
              <nav className="flex flex-wrap items-center gap-2">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm font-medium transition-all',
                      pathname === n.href
                        ? 'border-white/20 bg-white text-[#06235b] shadow-[0_10px_24px_rgba(255,255,255,0.2)]'
                        : 'border-white/12 bg-white/[0.08] text-white/[0.82] hover:bg-white/14',
                    )}
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-3 text-sm text-white/[0.72]">
                {user && <span>Olá, {user.name.split(' ')[0]}</span>}
                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={logout.isPending}
                    loadingText="Saindo..."
                    onClick={() => logout.mutate()}
                    className="border-white/15 bg-white/10 text-white shadow-none hover:bg-white/20"
                  >
                    Sair
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
