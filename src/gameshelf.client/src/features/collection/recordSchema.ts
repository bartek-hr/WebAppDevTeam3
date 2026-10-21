import { z } from 'zod'
import type { CollectionRecord } from '../../types'
import { MAX_IN_PROGRESS, MAX_RATING } from './collectionRules'

export const recordSchema = z
  .object({
    status: z.enum(['NotPlayed', 'InProgress', 'Played']),
    plays: z.number().int().nonnegative(),
    rating: z.number().int().min(1).max(MAX_RATING).optional(),
    note: z.string().trim().max(2000, 'Gebruik maximaal 2000 tekens.').optional(),
  })
  .strict()
export type RecordInput = z.infer<typeof recordSchema>

export function validateRecordUpdate(
  current: CollectionRecord,
  input: RecordInput,
  records: CollectionRecord[],
) {
  if (input.plays < current.plays) return 'Het aantal keer gespeeld mag niet omlaag.'
  const status = current.plays === 0 && input.plays > 0 ? 'Played' : input.status
  if (input.rating !== undefined && status !== 'Played') return 'Eerst spelen, dan beoordelen.'
  if (
    status === 'InProgress' &&
    records.filter(
      (r) => r.ownerId === current.ownerId && r.id !== current.id && r.status === 'InProgress',
    ).length >= MAX_IN_PROGRESS
  ) {
    return 'Maak eerst een campagne af: maximaal 3 campagnes tegelijk.'
  }
  return null
}
