// hooks/useCollection.ts
'use client'

import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query'

interface StickerQueryData {
  stickers: Array<{
    id: string
    quantity: number | null
  }>
}

interface UpdateVariables {
  stickerId: string
  quantity: number
}

interface MutationContext {
  snapshots: Array<[readonly unknown[], StickerQueryData | undefined]>
}

export function useCollection() {
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['stickers'] })

  function setStickerQuantity(stickerId: string, quantity: number | null) {
    queryClient.setQueriesData<StickerQueryData>({ queryKey: ['stickers'] }, (current) => {
      if (!current) return current

      return {
        ...current,
        stickers: current.stickers.map((sticker) =>
          sticker.id === stickerId ? { ...sticker, quantity } : sticker,
        ),
      }
    })
  }

  async function captureSnapshots() {
    await queryClient.cancelQueries({ queryKey: ['stickers'] })

    return queryClient.getQueriesData<StickerQueryData>({ queryKey: ['stickers'] })
  }

  function restoreSnapshots(snapshots: MutationContext['snapshots']) {
    for (const [queryKey, data] of snapshots) {
      queryClient.setQueryData(queryKey, data)
    }
  }

  const updateSticker = useMutation({
    mutationKey: ['collection', 'update'],
    mutationFn: async ({ stickerId, quantity }: UpdateVariables) => {
      const res = await fetch(`/api/collection/${stickerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })
      if (!res.ok) throw new Error('Erro ao atualizar figurinha')
    },
    onMutate: async ({ stickerId, quantity }): Promise<MutationContext> => {
      const snapshots = await captureSnapshots()
      setStickerQuantity(stickerId, quantity)
      return { snapshots }
    },
    onError: (_error, _variables, context) => {
      if (context) restoreSnapshots(context.snapshots)
    },
    onSettled: invalidate,
  })

  const removeSticker = useMutation({
    mutationKey: ['collection', 'remove'],
    mutationFn: async (stickerId: string) => {
      const res = await fetch(`/api/collection/${stickerId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao remover figurinha')
    },
    onMutate: async (stickerId): Promise<MutationContext> => {
      const snapshots = await captureSnapshots()
      setStickerQuantity(stickerId, null)
      return { snapshots }
    },
    onError: (_error, _variables, context) => {
      if (context) restoreSnapshots(context.snapshots)
    },
    onSettled: invalidate,
  })

  const pendingUpdates = useMutationState<UpdateVariables>({
    filters: { mutationKey: ['collection', 'update'], status: 'pending' },
    select: (mutation) => mutation.state.variables as UpdateVariables,
  })

  const pendingRemovals = useMutationState<string>({
    filters: { mutationKey: ['collection', 'remove'], status: 'pending' },
    select: (mutation) => mutation.state.variables as string,
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
    return pendingUpdates.some((variables) => variables.stickerId === stickerId)
  }

  function isRemovingSticker(stickerId: string) {
    return pendingRemovals.some((pendingStickerId) => pendingStickerId === stickerId)
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
