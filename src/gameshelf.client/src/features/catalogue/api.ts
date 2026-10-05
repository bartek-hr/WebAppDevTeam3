import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'
import type { Game } from '../../types'

// Voorbeeld van het patroon: per feature een api.ts met React Query hooks.
export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: async () => (await api.get<Game[]>('/games')).data,
  })
}
