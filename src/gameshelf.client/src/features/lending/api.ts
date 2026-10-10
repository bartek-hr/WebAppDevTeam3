import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'
import type { Box } from '../../types'

export function useBoxes() {
  return useQuery({
    queryKey: ['boxes'],
    queryFn: async () => (await api.get<Box[]>('/boxes')).data,
  })
}
