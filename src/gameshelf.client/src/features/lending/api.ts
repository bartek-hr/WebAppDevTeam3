import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import type { Box } from '../../types'
import type { BoxConditionUpdate, NewBox } from './lendingRules'

export function useBoxes() {
  return useQuery({
    queryKey: ['boxes'],
    queryFn: async () => (await api.get<Box[]>('/boxes')).data,
  })
}

export function useCreateBox() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (box: NewBox) => (await api.post<Box>('/boxes', box)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boxes'] }),
  })
}

export function useUpdateBox() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...update }: BoxConditionUpdate & { id: number }) =>
      (await api.put<Box>(`/boxes/${id}`, update)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boxes'] }),
  })
}

export function useDeleteBox() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/boxes/${id}`)
    },
    // Openstaande aanvragen op de doos worden afgewezen, dus die lijst verandert ook
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['boxes'] }),
        queryClient.invalidateQueries({ queryKey: ['loan-requests'] }),
      ]),
  })
}
