// app/(app)/collection/page.tsx
import { Suspense } from 'react'
import { StickerGrid } from '@/components/features/StickerGrid'
import { StickerGridSkeleton } from '@/components/features/StickerGridSkeleton'

export default function CollectionPage() {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#d9e2ff] bg-white/88 p-6 shadow-[0_20px_50px_rgba(6,35,91,0.08)] backdrop-blur sm:p-8">
        <div className="pointer-events-none absolute right-[-5rem] top-[-5rem] h-44 w-44 rounded-full bg-[#f5c518]/22 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-6rem] right-[16%] h-36 w-36 rounded-full bg-[#bf0a30]/12 blur-3xl" />
        <div className="pointer-events-none absolute inset-y-6 right-6 w-1/3 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.5)_0%,rgba(245,197,24,0.12)_34%,transparent_74%)] blur-2xl" />
        <div className="relative">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#bf0a30]">
            Minha coleção
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-[#06235b] sm:text-5xl">Álbum em campo</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Marque as figurinhas que você já tem, acompanhe repetidas por seleção e mantenha a ordem
            oficial do álbum para completar a coleção com mais rapidez.
          </p>
        </div>
      </section>

      <Suspense fallback={<StickerGridSkeleton />}>
        <StickerGrid />
      </Suspense>
    </div>
  )
}
