import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'
import type { CollectionRecord } from '../../types'

// De collectie van het ingelogde lid
export function useMyCollection() {
  return useQuery({
    queryKey: ['collection'],
    queryFn: async () => (await api.get<CollectionRecord[]>('/collection')).data,
  })
}
