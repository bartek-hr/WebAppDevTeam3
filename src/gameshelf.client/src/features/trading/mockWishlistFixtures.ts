import type { WishlistItem } from '../../types'
import { games } from '../catalogue/mocks'

// Tijdelijke fixtures uitsluitend voor het biedingenoverzicht (#19).
// Geen gedeelde verlanglijst-store: die hoort bij #25 (bartek-hr).
// Vervang bij integratie met #25 deze fixtures door diens items en stem de IDs af.
export const offerWishlistFixtures: WishlistItem[] = [
  { id: 1901, ownerId: 'm1', game: games[1], priority: 1, isFulfilled: false },
  { id: 1902, ownerId: 'm2', game: games[8], priority: 1, isFulfilled: false },
  { id: 1903, ownerId: 'm1', game: games[14], priority: 2, isFulfilled: true },
  { id: 1904, ownerId: 'm3', game: games[0], priority: 1, isFulfilled: false },
]
