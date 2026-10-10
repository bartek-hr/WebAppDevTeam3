import { format } from 'date-fns'
import { isOfferValid, OFFER_VALIDITY_DAYS, offerSchema, offerValidUntil } from './tradingRules'

const today = new Date(2026, 9, 10, 15, 30)

describe('offerValidUntil', () => {
  test('de termijn eindigt 14 dagen na de aanmaakdatum', () => {
    expect(OFFER_VALIDITY_DAYS).toBe(14)
    expect(format(offerValidUntil('2026-10-01'), 'yyyy-MM-dd')).toBe('2026-10-15')
  })
})

describe('isOfferValid', () => {
  test('een open bod van vandaag is geldig', () => {
    expect(isOfferValid({ status: 'Open', createdOn: '2026-10-10' }, today)).toBe(true)
  })

  test('een open bod is op de laatste dag van de termijn nog geldig', () => {
    expect(isOfferValid({ status: 'Open', createdOn: '2026-09-26' }, today)).toBe(true)
  })

  test('een open bod is de dag na de termijn verlopen', () => {
    expect(isOfferValid({ status: 'Open', createdOn: '2026-09-25' }, today)).toBe(false)
  })

  test('een bod dat niet meer open is, is niet geldig', () => {
    expect(isOfferValid({ status: 'Rejected', createdOn: '2026-10-10' }, today)).toBe(false)
  })
})

describe('offerSchema', () => {
  test('accepteert een gekozen game', () => {
    expect(offerSchema.safeParse({ askedGameId: 3 }).success).toBe(true)
  })

  test('zonder gekozen game geeft een nette melding', () => {
    // GamePicker geeft null door als er (nog) geen game gekozen is
    const result = offerSchema.safeParse({ askedGameId: null })
    expect(result.error?.issues[0].message).toBe('Kies de game die je terugvraagt')
  })
})
