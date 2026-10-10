import type { HttpHandler } from 'msw'
import type { Offer } from '../../types'

// Eigenaar: Rayell. Nep-endpoints voor deze feature (alleen actief als VITE_USE_MOCKS=true).

// Wat de backend opslaat: isValid wordt per response berekend
type OfferRecord = Omit<Offer, 'isValid'>

// Nog leeg: seed-biedingen hebben de verlanglijst-items uit de verlanglijst-mocks nodig
const seedOffers = (): OfferRecord[] => []

export const offers: OfferRecord[] = seedOffers()

// Zet de biedingen terug naar de seed, zodat tests niet van elkaars volgorde afhangen
export function resetTradingMocks() {
  offers.splice(0, offers.length, ...seedOffers())
}

export const tradingHandlers: HttpHandler[] = []
