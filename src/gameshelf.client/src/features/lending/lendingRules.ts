import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'
import type { Loan } from '../../types'

// Maximale uitleentermijn in dagen, constant tot de backend hem levert
export const MAX_LOAN_DAYS = 28

// Datums gaan als 'yyyy-MM-dd' over de API
export function toDateString(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

// Ook bij verlengen telt de termijn vanaf de startdatum
export function maxReturnDate(startDate: string) {
  return toDateString(addDays(parseISO(startDate), MAX_LOAN_DAYS))
}

// Te laat zodra de inleverdatum voorbij is en de doos nog niet terug is
export function isLoanLate(loan: Pick<Loan, 'returnDate' | 'returnedOn'>, today = new Date()) {
  return !loan.returnedOn && differenceInCalendarDays(today, parseISO(loan.returnDate)) > 0
}
