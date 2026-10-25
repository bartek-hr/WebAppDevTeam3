import { addDays, isAfter, parseISO, startOfDay } from 'date-fns'
import { z } from 'zod'
import type { Offer } from '../../types'

// Constante tot de backend hem levert
export const OFFER_VALIDITY_DAYS = 14

// Laatste dag waarop het bod nog geaccepteerd kan worden
export function offerValidUntil(createdOn: string) {
  return addDays(parseISO(createdOn), OFFER_VALIDITY_DAYS)
}

export function isOfferValid(offer: Pick<Offer, 'status' | 'createdOn'>, today = new Date()) {
  return offer.status === 'Open' && !isAfter(startOfDay(today), offerValidUntil(offer.createdOn))
}

// Validatie van een bod, gedeeld door het formulier en de mock-API
export const offerSchema = z.object({
  askedGameId: z
    .number({ error: 'Kies de game die je terugvraagt' })
    .int('Kies de game die je terugvraagt')
    .positive('Kies de game die je terugvraagt'),
})

export type NewOffer = z.infer<typeof offerSchema>
