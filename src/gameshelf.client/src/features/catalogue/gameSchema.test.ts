import { findDuplicate, findOtherEditions, gameSchema } from './gameSchema'
import { games } from './mocks'

const validGame = {
  title: 'Azul',
  publisher: 'Plan B Games',
  releaseYear: 2017,
  category: 'Abstract',
  minPlayers: 2,
  maxPlayers: 4,
  playingTimeMinutes: 40,
}

describe('gameSchema', () => {
  test('accepteert een geldige game', () => {
    expect(gameSchema.safeParse(validGame).success).toBe(true)
  })

  test('het maximum aantal spelers moet minstens het minimum zijn', () => {
    const result = gameSchema.safeParse({ ...validGame, minPlayers: 5, maxPlayers: 4 })
    expect(result.error?.issues[0].path).toEqual(['maxPlayers'])
  })

  test('een leeg getalveld geeft een nette melding', () => {
    // react-hook-form geeft NaN door voor een leeg veld met valueAsNumber
    const result = gameSchema.safeParse({ ...validGame, playingTimeMinutes: NaN })
    expect(result.error?.issues[0].message).toBe('Vul de speelduur in')
  })
})

describe('findDuplicate', () => {
  test('zelfde titel, uitgever en jaar is dezelfde doos, ongeacht hoofdletters en spaties', () => {
    const duplicate = findDuplicate(games, {
      title: ' catan ',
      publisher: '999 GAMES',
      releaseYear: 1995,
    })
    expect(duplicate?.publisher).toBe('999 Games')
  })

  test('een andere editie van dezelfde titel is geen dubbele', () => {
    expect(findDuplicate(games, { title: 'Catan', publisher: 'Kosmos', releaseYear: 1995 })).toBe(
      undefined,
    )
  })
})

test('findOtherEditions vindt de andere doos van dezelfde titel', () => {
  const catanNl = games.find((game) => game.title === 'Catan' && game.publisher === '999 Games')!
  expect(findOtherEditions(games, catanNl).map((game) => game.publisher)).toEqual(['Catan Studio'])
})
