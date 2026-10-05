import { authHandlers } from '../features/auth/mocks'
import { catalogueHandlers } from '../features/catalogue/mocks'
import { collectionHandlers } from '../features/collection/mocks'
import { lendingHandlers } from '../features/lending/mocks'
import { sessionsHandlers } from '../features/sessions/mocks'
import { shelvesHandlers } from '../features/shelves/mocks'
import { tradingHandlers } from '../features/trading/mocks'
import { wishlistHandlers } from '../features/wishlist/mocks'

// Iedere feature beheert zijn eigen nep-endpoints in features/<feature>/mocks.ts
export const handlers = [
  ...authHandlers,
  ...catalogueHandlers,
  ...collectionHandlers,
  ...shelvesHandlers,
  ...lendingHandlers,
  ...tradingHandlers,
  ...sessionsHandlers,
  ...wishlistHandlers,
]
