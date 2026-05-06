// app/(app)/collection/page.tsx
import { Suspense } from 'react'
import { StickerGrid } from '@/components/features/StickerGrid'
import { StickerGridSkeleton } from '@/components/features/StickerGridSkeleton'

export default function CollectionPage() {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#d9e2ff] bg-white/88 p-6 shadow-[0_20px_50px_rgba(6,35,91,0.08)] backdrop-blur sm:p-8">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top,rgba(245,197,24,0.16),transparent_56%)]" />
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
