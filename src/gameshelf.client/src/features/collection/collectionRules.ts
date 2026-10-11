import type { RecordStatus } from '../../types'

// Clubregel uit de casus: maximaal drie campagnes tegelijk bezig
export const MAX_IN_PROGRESS = 3

// Beoordeling in sterren, alleen bij status Played
export const MAX_RATING = 5

export const STATUS_LABELS: Record<RecordStatus, string> = {
  NotPlayed: 'Nog niet gespeeld',
  InProgress: 'Bezig',
  Played: 'Gespeeld',
}

export const STATUS_VARIANTS: Record<RecordStatus, string> = {
  NotPlayed: 'secondary',
  InProgress: 'warning',
  Played: 'success',
}

export const STATUSES = Object.keys(STATUS_LABELS) as RecordStatus[]

export function isRecordStatus(value: string): value is RecordStatus {
  return (STATUSES as string[]).includes(value)
}
