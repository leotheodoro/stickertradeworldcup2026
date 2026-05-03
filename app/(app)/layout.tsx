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
      <header className="bg-[#002868] shadow-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <span
            className="text-2xl tracking-widest text-white"
            style={{ fontFamily: 'var(--font-bebas, sans-serif)' }}
          >
            FIGURINHAS DA COPA
          </span>
          <nav className="flex items-center gap-4">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  pathname === n.href ? 'text-[#F5C518]' : 'text-white/80 hover:text-white',
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
