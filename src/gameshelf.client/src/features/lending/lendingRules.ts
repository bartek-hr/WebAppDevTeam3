import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'
import { nl } from 'date-fns/locale'
import { z } from 'zod'
import type { Loan, LoanRequest } from '../../types'

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

// Aantal dagen tot de inleverdatum; negatief als die al voorbij is
export function daysUntilReturn(returnDate: string, today = new Date()) {
  return differenceInCalendarDays(parseISO(returnDate), today)
}

// De eerste dag dat een lening te laat is: de dag na de inleverdatum
export function lateSince(returnDate: string) {
  return toDateString(addDays(parseISO(returnDate), 1))
}

// De DTO kent geen requestId: gestart = de aanvrager leende de doos op of na de aanvraagdatum
export function isLoanStarted(request: LoanRequest, loans: Loan[]) {
  return loans.some(
    (loan) =>
      loan.boxId === request.boxId &&
      loan.borrowerId === request.requesterId &&
      loan.startDate >= request.createdOn,
  )
}

type ExtendableLoan = Pick<Loan, 'startDate' | 'returnDate' | 'returnedOn' | 'isExtended'>

// Waarom deze lening niet verlengd kan worden, of null als het wel kan
export function getExtendBlockReason(loan: ExtendableLoan, today = new Date()) {
  if (loan.returnedOn) return 'Deze doos is al teruggebracht'
  if (loan.isExtended) return 'Je hebt deze lening al een keer verlengd'
  if (isLoanLate(loan, today)) return 'Te laat: verlengen kan niet meer'
  if (loan.returnDate >= maxReturnDate(loan.startDate)) {
    return 'De maximale uitleentermijn is al bereikt'
  }
  return null
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

// Grenzen voor een nieuwe inleverdatum, beide inclusief (ook voor min/max van het datumveld)
export interface ReturnDateBounds {
  earliest: string
  latest: string
}

// Lening starten: vanaf morgen, hooguit de maximale termijn vanaf vandaag
export function startLoanBounds(today = new Date()): ReturnDateBounds {
  return {
    earliest: toDateString(addDays(today, 1)),
    latest: toDateString(addDays(today, MAX_LOAN_DAYS)),
  }
}

// Verlengen: later dan de huidige inleverdatum, maar binnen de termijn vanaf de start
export function extendLoanBounds(loan: Pick<Loan, 'startDate' | 'returnDate'>): ReturnDateBounds {
  return {
    earliest: toDateString(addDays(parseISO(loan.returnDate), 1)),
    latest: maxReturnDate(loan.startDate),
  }
}

export function returnDateSchema({ earliest, latest }: ReturnDateBounds) {
  return z.object({
    returnDate: z.iso
      .date({ error: 'Kies een inleverdatum' })
      .refine((date) => date >= earliest, `Kies een datum vanaf ${formatDate(earliest)}`)
      .refine((date) => date <= latest, `Kies uiterlijk ${formatDate(latest)}`),
  })
}

export type ReturnDateInput = z.infer<ReturnType<typeof returnDateSchema>>

export const startLoanSchema = (today = new Date()) => returnDateSchema(startLoanBounds(today))

export const extendLoanSchema = (loan: Pick<Loan, 'startDate' | 'returnDate'>) =>
  returnDateSchema(extendLoanBounds(loan))
