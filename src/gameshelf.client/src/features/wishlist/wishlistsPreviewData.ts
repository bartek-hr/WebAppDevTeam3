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

const createPreviewItems = (): WishlistItem[] => [
  item(2601, 'm1', 2, 1, false, 'Voor onze volgende campagne.'),
  item(2602, 'm1', 15, 2),
  item(2603, 'm2', 9, 1, false, 'Liefst met Nederlandstalige spelregels.'),
  item(2604, 'm2', 3, 2, true),
  item(2605, 'm3', 1, 1),
  item(2606, 'm4', 9, 1),
]

// Alleen leesvoorbeelden voor #26, zolang #25 nog geen gedeelde mockitems levert.
// Deze IDs zijn tijdelijk en mogen niet worden gebruikt door biedingen (#19).
// Vervang deze fixtures bij integratie door de gedeelde bron van de eigenaar van #25.
export const wishlistsPreviewItems: WishlistItem[] = createPreviewItems()
