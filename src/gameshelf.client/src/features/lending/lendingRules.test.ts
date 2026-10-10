import { isLoanLate, MAX_LOAN_DAYS, maxReturnDate, toDateString } from './lendingRules'

const today = new Date(2026, 9, 10, 15, 30)

describe('maxReturnDate', () => {
  test('ligt de maximale termijn na de startdatum', () => {
    expect(MAX_LOAN_DAYS).toBe(28)
    expect(maxReturnDate('2026-10-01')).toBe('2026-10-29')
  })

  test('telt door over de maandgrens heen', () => {
    expect(maxReturnDate('2019-03-07')).toBe('2019-04-04')
  })
})

describe('isLoanLate', () => {
  test('is niet te laat op de inleverdatum zelf', () => {
    expect(isLoanLate({ returnDate: '2026-10-10' }, today)).toBe(false)
  })

  test('is te laat vanaf de dag na de inleverdatum', () => {
    expect(isLoanLate({ returnDate: '2026-10-09' }, today)).toBe(true)
  })

  test('een teruggebrachte doos is nooit te laat', () => {
    expect(isLoanLate({ returnDate: '2019-04-04', returnedOn: '2019-05-01' }, today)).toBe(false)
  })
})

test('toDateString geeft de datum als yyyy-MM-dd', () => {
  expect(toDateString(today)).toBe('2026-10-10')
})
