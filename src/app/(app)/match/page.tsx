'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TradeMatchCard } from '@/components/features/TradeMatchCard'
import { TradeMatchDetailModal } from '@/components/features/TradeMatchDetailModal'
import { useAuth } from '@/hooks/useAuth'
import { Skeleton } from '@/components/ui/skeleton'
import type { TradeMatchDetail, TradeMatchSummary } from '@/lib/trade-matches'

function MatchSection({
  title,
  description,
  matches,
  emptyMessage,
  onOpenDetails,
}: {
  title: string
  description: string
  matches: TradeMatchSummary[]
  emptyMessage: string
  onOpenDetails: (match: TradeMatchSummary) => void
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-[#06235b]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>

      {matches.length === 0 ? (
        <p className="rounded-[1.5rem] border border-dashed border-[#cbd7f7] bg-white/70 py-10 text-center text-slate-500">
          {emptyMessage}
        </p>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <TradeMatchCard key={match.userId} match={match} onOpenDetails={onOpenDetails} />
          ))}
        </div>
      )}
    </section>
  )
}

function MatchPageSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <Skeleton key={item} className="h-48 w-full" />
      ))}
    </div>
  )
}

export default function MatchPage() {
  const [selectedMatch, setSelectedMatch] = useState<TradeMatchSummary | null>(null)
  const { user } = useAuth()

  const matchesQuery = useQuery<{
    bestMatches: TradeMatchSummary[]
    canHelpYou: TradeMatchSummary[]
  }>({
    queryKey: ['trade-matches'],
    queryFn: async () => {
      const res = await fetch('/api/trade/matches?limit=15')
      if (!res.ok) throw new Error('Erro ao carregar ranking de trocas')
      return res.json()
    },
  })

  const detailQuery = useQuery<{ match: TradeMatchDetail }>({
    queryKey: ['trade-match-detail', selectedMatch?.userId],
    queryFn: async () => {
      const res = await fetch(`/api/trade/matches/${selectedMatch?.userId}`)
      if (!res.ok) throw new Error('Erro ao carregar detalhes da troca')
      return res.json()
    },
    enabled: selectedMatch !== null,
  })

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#d9e2ff] bg-white/88 p-6 shadow-[0_20px_50px_rgba(6,35,91,0.08)] backdrop-blur sm:p-8">
        <div className="pointer-events-none absolute right-[-5rem] top-[-4rem] h-44 w-44 rounded-full bg-[#f5c518]/24 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-5rem] right-[18%] h-32 w-32 rounded-full bg-[#bf0a30]/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-y-6 right-6 w-1/3 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.5)_0%,rgba(245,197,24,0.16)_34%,transparent_74%)] blur-2xl" />
        <div className="relative">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#bf0a30]">
            Match de trocas
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-[#06235b] sm:text-5xl">
            Com quem trocar?
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Cruzamos suas repetidas com as figurinhas que faltam para outros usuarios e fazemos
            o caminho inverso tambem. O ranking prioriza trocas mais completas, respeitando foil
            apenas com foil, e transforma isso em uma porcentagem estimada de compatibilidade.
          </p>
        </div>
      </section>

      {user?.city && user.uf && (
        <div className="rounded-[1.5rem] border border-[#d9e2ff] bg-[linear-gradient(180deg,rgba(246,248,255,0.94),rgba(255,255,255,0.88))] px-5 py-4 shadow-[0_14px_34px_rgba(6,35,91,0.06)]">
          <p className="text-sm font-semibold text-[#06235b]">
            Você está vendo pessoas de {user.city}/{user.uf}.
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            O ranking compara apenas usuários da sua cidade, para priorizar trocas que realmente
            podem sair do papel.
          </p>
        </div>
      )}

      {matchesQuery.isLoading && <MatchPageSkeleton />}

      {matchesQuery.isError && (
        <p className="rounded-[1.5rem] border border-[#ffd4d4] bg-[#fff5f5] py-10 text-center text-sm text-[#b42318]">
          Nao foi possivel carregar o ranking agora. Tente novamente em instantes.
        </p>
      )}

      {matchesQuery.data && (
        <>
          <MatchSection
            title="Melhores trocas"
            description="Aqui entram os usuarios com encaixe de mao dupla, onde voces ja conseguem trocar figurinhas um com o outro agora."
            matches={matchesQuery.data.bestMatches}
            emptyMessage="Ainda nao encontramos trocas de mao dupla para voce. Marque mais repetidas para fortalecer seus matchs."
            onOpenDetails={setSelectedMatch}
          />

          <MatchSection
            title="Pode te ajudar"
            description="Esses usuarios tem figurinhas que faltam para voce, mesmo que voce ainda nao tenha tantas repetidas uteis para eles."
            matches={matchesQuery.data.canHelpYou}
            emptyMessage="Ninguem com figurinhas uteis apareceu por enquanto. Complete sua colecao para melhorar o ranking."
            onOpenDetails={setSelectedMatch}
          />
        </>
      )}

      <TradeMatchDetailModal
        open={selectedMatch !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedMatch(null)
        }}
        match={detailQuery.data?.match ?? null}
        isLoading={detailQuery.isLoading}
      />
    </div>
  )
}
