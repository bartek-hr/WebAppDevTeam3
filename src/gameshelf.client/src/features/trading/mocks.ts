import { format } from 'date-fns'
import { http, HttpResponse, type HttpHandler } from 'msw'
import type { Offer } from '../../types'
import { getCurrentMember } from '../auth/mocks'
import { games } from '../catalogue/mocks'
import { isOfferValid, offerSchema } from './tradingRules'

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

const toOfferDto = (offer: OfferRecord): Offer => ({ ...offer, isValid: isOfferValid(offer) })

export const tradingHandlers: HttpHandler[] = [
  http.post('/api/wishlist-items/:id/offers', async ({ request, params }) => {
    const me = getCurrentMember(request)
    if (!me) {
      return HttpResponse.json({ message: 'Log in om een bod te doen.' }, { status: 401 })
    }
    const parsed = offerSchema.safeParse(await request.json())
    if (!parsed.success) {
      return HttpResponse.json({ message: parsed.error.issues[0].message }, { status: 400 })
    }
    const askedGame = games.find((game) => game.id === parsed.data.askedGameId)
    if (!askedGame) {
      return HttpResponse.json(
        { message: 'Deze game staat niet in de catalogus.' },
        { status: 404 },
      )
    }
    // Controles op het item (bestaat, eigen item, vervuld) volgen met de verlanglijst-mocks
    // Of de bieder de game bezit controleren we bewust niet: de club werkt op vertrouwen
    const created: OfferRecord = {
      id: Math.max(0, ...offers.map((offer) => offer.id)) + 1,
      wishlistItemId: Number(params.id),
      offeredById: me.id,
      askedGame,
      createdOn: format(new Date(), 'yyyy-MM-dd'),
      status: 'Open',
    }
    offers.push(created)
    return HttpResponse.json(toOfferDto(created), { status: 201 })
  }),
]
