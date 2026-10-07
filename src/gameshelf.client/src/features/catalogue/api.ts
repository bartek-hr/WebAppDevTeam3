import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import type { Game } from '../../types'
import type { NewGame } from './gameSchema'

// Voorbeeld van het patroon: per feature een api.ts met React Query hooks.
export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: async () => (await api.get<Game[]>('/games')).data,
  })
}

export function useGame(id: number) {
  return useQuery({
    queryKey: ['games', id],
    queryFn: async () => (await api.get<Game>(`/games/${id}`)).data,
    enabled: Number.isInteger(id),
  })
}

export function useCreateGame() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (game: NewGame) => (await api.post<Game>('/games', game)).data,
    onSuccess: (game) => {
      queryClient.setQueryData(['games', game.id], game)
      return queryClient.invalidateQueries({ queryKey: ['games'], exact: true })
    },
  })
}
