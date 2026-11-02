import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'
import type { WishlistItem } from '../../types'

export function useWishlistsPreview() {
  return useQuery({
    queryKey: ['wishlists-preview'],
    queryFn: async () => (await api.get<WishlistItem[]>('/wishlists-preview')).data,
  })
}
