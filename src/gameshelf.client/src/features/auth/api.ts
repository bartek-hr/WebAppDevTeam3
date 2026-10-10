import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'
import type { Member } from '../../types'

// Alle leden, bijv. om bij een id de gebruikersnaam te tonen
export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: async () => (await api.get<Member[]>('/members')).data,
  })
}

export function useMember(id: string) {
  return useQuery({
    queryKey: ['members', id],
    queryFn: async () => (await api.get<Member>(`/members/${id}`)).data,
  })
}
