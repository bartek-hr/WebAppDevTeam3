import { http, HttpResponse, type HttpHandler } from 'msw'
import type { Game } from '../../types'
import { getCurrentMember } from '../auth/mocks'
import { findDuplicate, gameSchema } from './gameSchema'

const game = (
  title: string,
  publisher: string,
  releaseYear: number,
  category: string,
  minPlayers: number,
  maxPlayers: number,
  playingTimeMinutes: number,
): Omit<Game, 'id'> => ({
  title,
  publisher,
  releaseYear,
  category,
  minPlayers,
  maxPlayers,
  playingTimeMinutes,
})

// Eigenaar: Floris. Nep-data voor de catalogus, andere features mogen deze games (en id's) hergebruiken.
// Catan en Codenames staan er twee keer in: de Nederlandse en de Engelse doos zijn aparte games.
export const games: Game[] = [
  game('Catan', '999 Games', 1995, 'Strategie', 3, 4, 75),
  game('Gloomhaven', 'Cephalofair Games', 2017, 'Campagne', 1, 4, 120),
  game('Codenames', 'White Goblin Games', 2016, 'Party', 2, 8, 15),
  game('Codenames', 'Czech Games Edition', 2015, 'Party', 2, 8, 15),
  game('Catan', 'Catan Studio', 2015, 'Strategie', 3, 4, 75),
  game('Pandemic Legacy: Season 1', 'Z-Man Games', 2015, 'Campagne', 2, 4, 60),
  game('Pandemic Legacy: Season 2', 'Z-Man Games', 2017, 'Campagne', 2, 4, 60),
  game('Gloomhaven: Jaws of the Lion', 'Cephalofair Games', 2020, 'Campagne', 1, 4, 120),
  game('Wingspan', 'Stonemaier Games', 2019, 'Strategie', 1, 5, 70),
  game('Ticket to Ride: Europe', 'Days of Wonder', 2005, 'Familie', 2, 5, 60),
  game('Carcassonne', '999 Games', 2000, 'Familie', 2, 5, 45),
  game('Patchwork', 'Lookout Games', 2014, 'Voor twee', 2, 2, 30),
  game('7 Wonders Duel', 'Repos Production', 2015, 'Voor twee', 2, 2, 30),
  game('Dixit', 'Libellud', 2008, 'Party', 3, 6, 30),
  game('Azul', 'Next Move Games', 2017, 'Abstract', 2, 4, 40),
  game('Mysterium', 'Libellud', 2015, 'Coöperatief', 2, 7, 42),
  game('Twilight Imperium (4e editie)', 'Fantasy Flight Games', 2017, 'Strategie', 3, 6, 480),
].map((data, index) => ({ id: index + 1, ...data }))

export const catalogueHandlers: HttpHandler[] = [
  http.get('/api/games', () => HttpResponse.json(games)),

  http.get('/api/games/:id', ({ params }) => {
    const found = games.find((g) => g.id === Number(params.id))
    return found
      ? HttpResponse.json(found)
      : HttpResponse.json({ message: 'Deze game staat niet in de catalogus.' }, { status: 404 })
  }),

  http.post('/api/games', async ({ request }) => {
    if (!getCurrentMember(request)) {
      return HttpResponse.json({ message: 'Log in om een game toe te voegen.' }, { status: 401 })
    }
    const parsed = gameSchema.safeParse(await request.json())
    if (!parsed.success) {
      return HttpResponse.json({ message: parsed.error.issues[0].message }, { status: 400 })
    }
    if (findDuplicate(games, parsed.data)) {
      return HttpResponse.json(
        { message: 'Deze editie staat al in de catalogus.' },
        { status: 409 },
      )
    }
    const created: Game = { id: Math.max(0, ...games.map((g) => g.id)) + 1, ...parsed.data }
    games.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),
]
