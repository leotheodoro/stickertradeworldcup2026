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

  async function toggleOwned(stickerId: string) {
    await updateSticker.mutateAsync({ stickerId, quantity: 1 })
  }

  async function updateQuantity(stickerId: string, quantity: number) {
    if (quantity < 1) {
      await removeSticker.mutateAsync(stickerId)
    } else {
      await updateSticker.mutateAsync({ stickerId, quantity })
    }
  }

  async function removeFromCollection(stickerId: string) {
    await removeSticker.mutateAsync(stickerId)
  }

  function isUpdatingSticker(stickerId: string) {
    return updateSticker.isPending && updateSticker.variables?.stickerId === stickerId
  }

  function isRemovingSticker(stickerId: string) {
    return removeSticker.isPending && removeSticker.variables === stickerId
  }

  function isStickerPending(stickerId: string) {
    return isUpdatingSticker(stickerId) || isRemovingSticker(stickerId)
  }

  return {
    toggleOwned,
    updateQuantity,
    removeSticker: removeFromCollection,
    isUpdatingSticker,
    isRemovingSticker,
    isStickerPending,
  }
}
