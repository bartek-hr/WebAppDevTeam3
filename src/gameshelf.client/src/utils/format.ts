import type { Game } from '../types'

export function formatPlayers({ minPlayers, maxPlayers }: Pick<Game, 'minPlayers' | 'maxPlayers'>) {
  if (minPlayers === maxPlayers) return `${minPlayers} ${minPlayers === 1 ? 'speler' : 'spelers'}`
  return `${minPlayers}–${maxPlayers} spelers`
}

export function formatPlayingTime(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} uur` : `${hours} uur ${rest} min`
}

// Een game is één editie, dus uitgever en jaar horen bij de naam
export function formatEdition({ publisher, releaseYear }: Pick<Game, 'publisher' | 'releaseYear'>) {
  return `${publisher}, ${releaseYear}`
}
