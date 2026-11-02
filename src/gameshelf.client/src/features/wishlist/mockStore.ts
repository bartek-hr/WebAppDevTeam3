import type { WishlistItem } from '../../types'
import { games } from '../catalogue/mocks'

function item(
  id: number,
  ownerId: string,
  gameId: number,
  priority: number,
  isFulfilled = false,
  note?: string,
): WishlistItem {
  const game = games.find((game) => game.id === gameId)
  if (!game) throw new Error(`Mockgame ${gameId} bestaat niet`)
  return { id, ownerId, game, priority, isFulfilled, note }
}

const seedWishlistItems = (): WishlistItem[] => [
  item(1, 'm1', 2, 1, false, 'Voor onze volgende campagne.'),
  item(2, 'm1', 15, 2),
  item(3, 'm2', 9, 1, false, 'Liefst met Nederlandstalige spelregels.'),
  item(4, 'm2', 3, 2, true),
  item(5, 'm3', 1, 1),
  item(6, 'm4', 9, 1),
]

// Eén gedeelde bron voor mijn verlanglijst (#25), alle verlanglijsten (#26) en biedingen (#19).
// Houd IDs stabiel: biedingen verwijzen naar deze items via wishlistItemId.
export const wishlistItems: WishlistItem[] = seedWishlistItems()

export function resetWishlistMocks() {
  wishlistItems.splice(0, wishlistItems.length, ...seedWishlistItems())
}
