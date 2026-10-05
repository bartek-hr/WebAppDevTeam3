import { http, HttpResponse, type HttpHandler } from 'msw'
import type { Game } from '../../types'

// Eigenaar: Floris. Nep-data voor de catalogus, andere features mogen deze games hergebruiken.
export const games: Game[] = [
  {
    id: 1,
    title: 'Catan',
    publisher: '999 Games',
    releaseYear: 1995,
    category: 'Strategie',
    minPlayers: 3,
    maxPlayers: 4,
    playingTimeMinutes: 75,
  },
  {
    id: 2,
    title: 'Gloomhaven',
    publisher: 'Cephalofair Games',
    releaseYear: 2017,
    category: 'Campagne',
    minPlayers: 1,
    maxPlayers: 4,
    playingTimeMinutes: 120,
  },
  {
    id: 3,
    title: 'Codenames (NL)',
    publisher: 'White Goblin Games',
    releaseYear: 2016,
    category: 'Party',
    minPlayers: 4,
    maxPlayers: 8,
    playingTimeMinutes: 15,
  },
]

export const catalogueHandlers: HttpHandler[] = [
  http.get('/api/games', () => HttpResponse.json(games)),
]
