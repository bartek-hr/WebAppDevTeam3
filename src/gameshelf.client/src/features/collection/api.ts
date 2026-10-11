import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import type { CollectionRecord, Shelf } from '../../types'
import type { RecordInput } from './recordSchema'

// De collectie van het ingelogde lid
export function useMyCollection(enabled = true) {
  return useQuery({
    queryKey: ['collection'],
    enabled,
    queryFn: async () => (await api.get<CollectionRecord[]>('/collection')).data,
  })
}

export function useCollectionMutation<T>(mutationFn: (input: T) => Promise<unknown>) {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['collection'] }),
        client.invalidateQueries({ queryKey: ['shelves'] }),
      ])
    },
  })
}

export function useAddToCollection() {
  return useCollectionMutation((gameId: number) => api.post('/collection', { gameId }))
}

export function useRemoveFromCollection() {
  return useCollectionMutation((id: number) => api.delete(`/collection/${id}`))
}

export function useRecordShelves(id: number) {
  return useQuery({
    queryKey: ['shelves', 'record', id],
    queryFn: async () => (await api.get<Shelf[]>(`/collection/${id}/shelves`)).data,
  })
}

export function useUpdateCollectionRecord() {
  return useCollectionMutation(({ id, ...values }: RecordInput & { id: number }) =>
    api.put(`/collection/${id}`, values),
  )
}
