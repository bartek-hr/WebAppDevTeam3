import { z } from 'zod'
import type { Game } from '../../types'

const currentYear = new Date().getFullYear()

// Validatie van een nieuwe game, gedeeld door het formulier en de mock-API
export const gameSchema = z
  .object({
    title: z.string().trim().min(1, 'Vul een titel in').max(200, 'Maximaal 200 tekens'),
    publisher: z.string().trim().min(1, 'Vul een uitgever in').max(100, 'Maximaal 100 tekens'),
    releaseYear: z
      .number({ error: 'Vul een jaartal in' })
      .int('Vul een geldig jaartal in')
      .min(1900, 'Vul een geldig jaartal in')
      .max(currentYear + 1, 'Vul een geldig jaartal in'),
    category: z.string().trim().min(1, 'Kies of typ een categorie').max(50, 'Maximaal 50 tekens'),
    minPlayers: z
      .number({ error: 'Vul een aantal in' })
      .int('Vul een heel getal in')
      .min(1, 'Minimaal 1 speler')
      .max(100, 'Maximaal 100 spelers'),
    maxPlayers: z
      .number({ error: 'Vul een aantal in' })
      .int('Vul een heel getal in')
      .min(1, 'Minimaal 1 speler')
      .max(100, 'Maximaal 100 spelers'),
    playingTimeMinutes: z
      .number({ error: 'Vul de speelduur in' })
      .int('Vul een heel aantal minuten in')
      .min(1, 'Minimaal 1 minuut')
      .max(1440, 'Maximaal 1440 minuten'),
    boxImageUrl: z.string().optional(),
  })
  .refine((game) => game.minPlayers <= game.maxPlayers, {
    error: 'Het maximum moet minstens gelijk zijn aan het minimum',
    path: ['maxPlayers'],
  })

export type NewGame = z.infer<typeof gameSchema>

const normalize = (text: string) => text.trim().toLowerCase()

// Dezelfde titel, uitgever en jaar is dezelfde doos. Een andere editie mag wel.
export function findDuplicate(
  games: Game[],
  game: Pick<Game, 'title' | 'publisher' | 'releaseYear'>,
) {
  return games.find(
    (g) =>
      normalize(g.title) === normalize(game.title) &&
      normalize(g.publisher) === normalize(game.publisher) &&
      g.releaseYear === game.releaseYear,
  )
}

// Alle edities (dozen) met deze titel
export function findEditions(games: Game[], title: string) {
  return games.filter((g) => normalize(g.title) === normalize(title))
}

export function findOtherEditions(games: Game[], game: Pick<Game, 'id' | 'title'>) {
  return findEditions(games, game.title).filter((g) => g.id !== game.id)
}
