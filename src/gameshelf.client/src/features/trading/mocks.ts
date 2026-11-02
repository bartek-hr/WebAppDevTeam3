import { format, subDays } from 'date-fns'
import { http, HttpResponse, type HttpHandler } from 'msw'
import type { Offer } from '../../types'
import { getCurrentMember, members } from '../auth/mocks'
import { games } from '../catalogue/mocks'
import { wishlistItems } from '../wishlist/mockStore'
import { isOfferValid, offerSchema } from './tradingRules'

// Eigenaar: Rayell. Nep-endpoints voor deze feature (alleen actief als VITE_USE_MOCKS=true).

// Wat de backend opslaat: isValid wordt per response berekend
type OfferRecord = Omit<Offer, 'isValid'>

// Relatieve datums houden geldige en verlopen voorbeelden bruikbaar in de demo.
const seedOffers = (): OfferRecord[] => {
  const date = (daysAgo: number) => format(subDays(new Date(), daysAgo), 'yyyy-MM-dd')
  return [
    {
      id: 1,
      wishlistItemId: 1,
      offeredById: 'm2',
      askedGame: games[14],
      createdOn: date(1),
      status: 'Open',
    },
    {
      id: 2,
      wishlistItemId: 1,
      offeredById: 'm3',
      askedGame: games[2],
      createdOn: date(15),
      status: 'Open',
    },
    {
      id: 3,
      wishlistItemId: 4,
      offeredById: 'm1',
      askedGame: games[10],
      createdOn: date(5),
      status: 'Accepted',
    },
    {
      id: 4,
      wishlistItemId: 3,
      offeredById: 'm1',
      askedGame: games[11],
      createdOn: date(2),
      status: 'Open',
    },
    {
      id: 5,
      wishlistItemId: 5,
      offeredById: 'm1',
      askedGame: games[12],
      createdOn: date(7),
      status: 'Rejected',
    },
    {
      id: 6,
      wishlistItemId: 3,
      offeredById: 'm1',
      askedGame: games[13],
      createdOn: date(4),
      status: 'Cancelled',
    },
    // Een bod waar m1 niet bij betrokken is, voor de afscherming van het overzicht.
    {
      id: 7,
      wishlistItemId: 5,
      offeredById: 'm4',
      askedGame: games[10],
      createdOn: date(3),
      status: 'Open',
    },
  ]
}

export const offers: OfferRecord[] = seedOffers()

// Zet de biedingen terug naar de seed, zodat tests niet van elkaars volgorde afhangen
export function resetTradingMocks() {
  offers.splice(0, offers.length, ...seedOffers())
}

const toOfferDto = (offer: OfferRecord): Offer => ({ ...offer, isValid: isOfferValid(offer) })

export const tradingHandlers: HttpHandler[] = [
  http.get('/api/offers', ({ request }) => {
    const me = getCurrentMember(request)
    if (!me) return HttpResponse.json({ message: 'Niet ingelogd' }, { status: 401 })

    const overview = offers.flatMap((offer) => {
      const wishlistItem = wishlistItems.find((item) => item.id === offer.wishlistItemId)
      if (!wishlistItem || (wishlistItem.ownerId !== me.id && offer.offeredById !== me.id))
        return []
      const owner = members.find((member) => member.id === wishlistItem.ownerId)
      const offeredBy = members.find((member) => member.id === offer.offeredById)
      if (!owner || !offeredBy) return []
      return [{ ...toOfferDto(offer), wishlistItem, owner, offeredBy }]
    })
    overview.sort((a, b) => b.createdOn.localeCompare(a.createdOn) || b.id - a.id)
    return HttpResponse.json(overview)
  }),
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
