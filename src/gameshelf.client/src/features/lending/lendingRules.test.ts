import {
  boxConditionSchema,
  boxSchema,
  daysUntilReturn,
  extendLoanBounds,
  extendLoanSchema,
  formatDate,
  getExtendBlockReason,
  isLoanLate,
  lateSince,
  MAX_LOAN_DAYS,
  maxReturnDate,
  startLoanBounds,
  startLoanSchema,
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

describe('daysUntilReturn', () => {
  test('telt de dagen tot de inleverdatum', () => {
    expect(daysUntilReturn('2026-10-14', today)).toBe(4)
    expect(daysUntilReturn('2026-10-10', today)).toBe(0)
  })

  test('is negatief als de inleverdatum voorbij is', () => {
    expect(daysUntilReturn('2026-10-08', today)).toBe(-2)
  })
})

test('lateSince is de dag na de inleverdatum', () => {
  expect(lateSince('2019-04-04')).toBe('2019-04-05')
})

describe('getExtendBlockReason', () => {
  const loan = {
    startDate: '2026-09-30',
    returnDate: '2026-10-14',
    isExtended: false,
  }

  test('een lopende lening binnen de termijn mag verlengd worden', () => {
    expect(getExtendBlockReason(loan, today)).toBeNull()
  })

  test('een teruggebrachte lening kan niet verlengd worden', () => {
    expect(getExtendBlockReason({ ...loan, returnedOn: '2026-10-09' }, today)).toBe(
      'Deze doos is al teruggebracht',
    )
  })

  test('verlengen kan maar één keer', () => {
    expect(getExtendBlockReason({ ...loan, isExtended: true }, today)).toBe(
      'Je hebt deze lening al een keer verlengd',
    )
  })

  test('een lening die te laat is kan niet verlengd worden', () => {
    expect(getExtendBlockReason({ ...loan, returnDate: '2026-10-09' }, today)).toBe(
      'Te laat: verlengen kan niet meer',
    )
  })

  test('de doos bij de neef is te laat', () => {
    const cousinLoan = { startDate: '2019-03-07', returnDate: '2019-04-04', isExtended: false }
    expect(getExtendBlockReason(cousinLoan, today)).toBe('Te laat: verlengen kan niet meer')
  })

  test('niet verlengen als de inleverdatum al op het maximum ligt', () => {
    expect(getExtendBlockReason({ ...loan, returnDate: '2026-10-28' }, today)).toBe(
      'De maximale uitleentermijn is al bereikt',
    )
  })
})

test('een lening starten kan met een inleverdatum van morgen tot de maximale termijn', () => {
  expect(startLoanBounds(today)).toEqual({ earliest: '2026-10-11', latest: '2026-11-07' })
})

test('verlengen kan vanaf de dag na de inleverdatum tot de maximale termijn vanaf de start', () => {
  expect(extendLoanBounds({ startDate: '2026-09-30', returnDate: '2026-10-14' })).toEqual({
    earliest: '2026-10-15',
    latest: '2026-10-28',
  })
})

describe('startLoanSchema', () => {
  const schema = startLoanSchema(today)
  const messageFor = (returnDate: string) =>
    schema.safeParse({ returnDate }).error?.issues[0].message

  test('accepteert een datum binnen de maximale termijn', () => {
    expect(schema.safeParse({ returnDate: '2026-10-24' }).success).toBe(true)
    expect(schema.safeParse({ returnDate: '2026-11-07' }).success).toBe(true)
  })

  test('de inleverdatum moet na vandaag liggen', () => {
    expect(messageFor('2026-10-10')).toBe('Kies een datum vanaf 11 oktober 2026')
  })

  test('de inleverdatum mag niet na de maximale termijn liggen', () => {
    expect(messageFor('2026-11-08')).toBe('Kies uiterlijk 7 november 2026')
  })

  test('zonder geldige datum geeft een nette melding', () => {
    expect(messageFor('')).toBe('Kies een inleverdatum')
    expect(messageFor('2026-02-30')).toBe('Kies een inleverdatum')
  })
})

describe('extendLoanSchema', () => {
  const schema = extendLoanSchema({ startDate: '2026-09-30', returnDate: '2026-10-14' })
  const messageFor = (returnDate: string) =>
    schema.safeParse({ returnDate }).error?.issues[0].message

  test('accepteert een latere datum tot het maximum vanaf de start', () => {
    expect(schema.safeParse({ returnDate: '2026-10-15' }).success).toBe(true)
    expect(schema.safeParse({ returnDate: '2026-10-28' }).success).toBe(true)
  })

  test('de nieuwe datum moet na de huidige inleverdatum liggen', () => {
    expect(messageFor('2026-10-14')).toBe('Kies een datum vanaf 15 oktober 2026')
  })

  test('de termijn telt vanaf de startdatum, niet vanaf de oude inleverdatum', () => {
    expect(messageFor('2026-10-29')).toBe('Kies uiterlijk 28 oktober 2026')
  })
})
