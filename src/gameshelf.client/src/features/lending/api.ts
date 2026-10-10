import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import type { Box, Loan, LoanRequest } from '../../types'
import type { BoxConditionUpdate, NewBox, ReturnDateInput } from './lendingRules'

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

// Leningen waarin ik de doos uitleen of leen
export function useLoans() {
  return useQuery({
    queryKey: ['loans'],
    queryFn: async () => (await api.get<Loan[]>('/loans')).data,
  })
}

// Alle lopende leningen van alle leden, alleen voor het bestuur
export function useActiveLoans() {
  return useQuery({
    queryKey: ['loans', 'active'],
    queryFn: async () => (await api.get<Loan[]>('/loans/active')).data,
  })
}

// Starten en terugbrengen veranderen ook of de doos is uitgeleend (['loans'] dekt ook 'active')
function invalidateLoansAndBoxes(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['loans'] }),
    queryClient.invalidateQueries({ queryKey: ['boxes'] }),
  ])
}

export function useStartLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: ReturnDateInput & { requestId: number }) =>
      (await api.post<Loan>('/loans', input)).data,
    onSuccess: () => invalidateLoansAndBoxes(queryClient),
  })
}

export function useExtendLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: ReturnDateInput & { id: number }) =>
      (await api.post<Loan>(`/loans/${id}/extend`, input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loans'] }),
  })
}

export function useReturnLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => (await api.post<Loan>(`/loans/${id}/return`)).data,
    onSuccess: () => invalidateLoansAndBoxes(queryClient),
  })
}
