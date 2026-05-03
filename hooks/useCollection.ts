// hooks/useCollection.ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useCollection() {
  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['stickers'] })

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
    if (quantity < 1) {
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
