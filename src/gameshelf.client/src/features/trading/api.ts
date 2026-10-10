import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import type { Offer } from '../../types'
import type { NewOffer } from './tradingRules'

interface CreateOfferInput extends NewOffer {
  wishlistItemId: number
}

export function useCreateOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ wishlistItemId, askedGameId }: CreateOfferInput) =>
      (await api.post<Offer>(`/wishlist-items/${wishlistItemId}/offers`, { askedGameId })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['offers'] }),
  })
}
