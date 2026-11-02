import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import type { Offer, Member, WishlistItem } from '../../types'
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

// Het overzicht bevat de gekoppelde items en leden, niet alleen hun id's.
export interface OfferOverview extends Offer {
  wishlistItem: WishlistItem
  offeredBy: Member
  owner: Member
}

export function useOffers(memberId?: string) {
  return useQuery({
    queryKey: ['offers', memberId],
    queryFn: async () => (await api.get<OfferOverview[]>('/offers')).data,
    enabled: !!memberId,
    // Geldigheid wordt opnieuw berekend, ook als de pagina open blijft staan.
    refetchInterval: 60_000,
  })
}
