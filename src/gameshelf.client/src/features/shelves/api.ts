import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import type { CollectionRecord, Shelf } from '../../types'
import type { ShelfInput } from './shelfSchema'

export function useMyShelves() {
  return useQuery({
    queryKey: ['shelves', 'mine'],
    queryFn: async () => (await api.get<Shelf[]>('/shelves')).data,
  })
}
export function useShelfMutation<T>(mutationFn: (input: T) => Promise<unknown>) {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => client.invalidateQueries({ queryKey: ['shelves'] }),
  })
}
export function useSaveShelf() {
  return useShelfMutation(({ id, ...values }: ShelfInput & { id?: number }) =>
    id === undefined ? api.post('/shelves', values) : api.put(`/shelves/${id}`, values),
  )
}
export function useDeleteShelf() {
  return useShelfMutation((id: number) => api.delete(`/shelves/${id}`))
}

export interface ShelfDetail extends Shelf {
  records: CollectionRecord[]
}
export function useShelf(id: number) {
  return useQuery({
    queryKey: ['shelves', 'detail', id],
    queryFn: async () => (await api.get<ShelfDetail>(`/shelves/${id}`)).data,
  })
}
export function useAddShelfRecord() {
  return useShelfMutation(({ shelfId, recordId }: { shelfId: number; recordId: number }) =>
    api.post(`/shelves/${shelfId}/records`, { recordId }),
  )
}
export function useRemoveShelfRecord() {
  return useShelfMutation(({ shelfId, recordId }: { shelfId: number; recordId: number }) =>
    api.delete(`/shelves/${shelfId}/records/${recordId}`),
  )
}

export function useMemberShelves(memberId: string) {
  return useQuery({
    queryKey: ['shelves', 'member', memberId],
    queryFn: async () =>
      (await api.get<Shelf[]>('/shelves', { params: { member: memberId } })).data,
  })
}
