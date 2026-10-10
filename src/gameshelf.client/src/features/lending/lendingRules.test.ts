import {
  boxConditionSchema,
  boxSchema,
  formatDate,
  isLoanLate,
  MAX_LOAN_DAYS,
  maxReturnDate,
  toDateString,
} from './lendingRules'

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

describe('boxSchema', () => {
  test('accepteert een game met een beschrijving en haalt spaties weg', () => {
    const result = boxSchema.safeParse({ gameId: 1, condition: '  Compleet  ' })
    expect(result.data).toEqual({ gameId: 1, condition: 'Compleet' })
  })

  test('zonder game geeft een nette melding', () => {
    const result = boxSchema.safeParse({ gameId: null, condition: 'Compleet' })
    expect(result.error?.issues[0].message).toBe('Kies een game')
  })

  test('alleen spaties is geen beschrijving', () => {
    const result = boxSchema.safeParse({ gameId: 1, condition: '   ' })
    expect(result.error?.issues[0].message).toBe('Beschrijf de staat van de doos')
  })

  test('de beschrijving mag niet te lang zijn', () => {
    const result = boxSchema.safeParse({ gameId: 1, condition: 'x'.repeat(501) })
    expect(result.error?.issues[0].message).toBe('Maximaal 500 tekens')
  })
})

test('boxConditionSchema vraagt alleen de staat', () => {
  expect(boxConditionSchema.safeParse({ condition: 'Als nieuw' }).success).toBe(true)
  expect(boxConditionSchema.safeParse({ condition: '' }).success).toBe(false)
})

describe('formatDate', () => {
  test('schrijft de datum uit in het Nederlands', () => {
    expect(formatDate('2019-03-07')).toBe('7 maart 2019')
    expect(formatDate('2026-10-10')).toBe('10 oktober 2026')
  })
})
