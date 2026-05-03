// app/(app)/collection/page.tsx
import { Suspense } from 'react'
import { StickerGrid } from '@/components/features/StickerGrid'
import { StickerGridSkeleton } from '@/components/features/StickerGridSkeleton'

export default function CollectionPage() {
  return (
    <div>
      <h1
        className="mb-6 text-4xl text-[#002868]"
        style={{ fontFamily: 'var(--font-bebas, sans-serif)' }}
      >
        Minha Coleção
      </h1>
      <Suspense fallback={<StickerGridSkeleton />}>
        <StickerGrid />
      </Suspense>
    </div>
  )
}
