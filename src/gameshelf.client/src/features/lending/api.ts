import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import type { Box, LoanRequest } from '../../types'
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

// Mijn aanvragen en de aanvragen op mijn dozen in één lijst
export function useLoanRequests() {
  return useQuery({
    queryKey: ['loan-requests'],
    queryFn: async () => (await api.get<LoanRequest[]>('/requests')).data,
  })
}

export function useRequestBox() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (boxId: number) =>
      (await api.post<LoanRequest>(`/boxes/${boxId}/requests`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loan-requests'] }),
  })
}

// Goedkeuren wijst ook de andere openstaande aanvragen op dezelfde doos af
export function useApproveRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => (await api.post<LoanRequest>(`/requests/${id}/approve`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loan-requests'] }),
  })
}

export function useRejectRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => (await api.post<LoanRequest>(`/requests/${id}/reject`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loan-requests'] }),
  })
}
