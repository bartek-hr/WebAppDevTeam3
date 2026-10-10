import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'
import { nl } from 'date-fns/locale'
import { z } from 'zod'
import type { Loan } from '../../types'

// Maximale uitleentermijn in dagen, constant tot de backend hem levert
export const MAX_LOAN_DAYS = 28

// Datums gaan als 'yyyy-MM-dd' over de API
export function toDateString(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

// Een datum uit de API als Nederlandse tekst, bijv. '7 maart 2019'
export function formatDate(date: string) {
  return format(parseISO(date), 'd MMMM yyyy', { locale: nl })
}

// Ook bij verlengen telt de termijn vanaf de startdatum
export function maxReturnDate(startDate: string) {
  return toDateString(addDays(parseISO(startDate), MAX_LOAN_DAYS))
}

// Te laat zodra de inleverdatum voorbij is en de doos nog niet terug is
export function isLoanLate(loan: Pick<Loan, 'returnDate' | 'returnedOn'>, today = new Date()) {
  return !loan.returnedOn && differenceInCalendarDays(today, parseISO(loan.returnDate)) > 0
}

// Doos aanbieden of bewerken, gedeeld door het formulier en de mock-API
export const boxSchema = z.object({
  gameId: z.number({ error: 'Kies een game' }).int('Kies een game'),
  condition: z
    .string()
    .trim()
    .min(1, 'Beschrijf de staat van de doos')
    .max(500, 'Maximaal 500 tekens'),
})

export type NewBox = z.infer<typeof boxSchema>

// Bij bewerken verandert alleen de staat, de game blijft dezelfde
export const boxConditionSchema = boxSchema.pick({ condition: true })

export type BoxConditionUpdate = z.infer<typeof boxConditionSchema>
