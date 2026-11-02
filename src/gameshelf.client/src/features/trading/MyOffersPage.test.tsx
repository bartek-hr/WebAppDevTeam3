import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/server'
import { loginAs, renderRoutes } from '../../test/utils'
import MyOffersPage from './MyOffersPage'
import { resetTradingMocks } from './mocks'

beforeEach(() => {
  resetTradingMocks()
  loginAs('m1')
})

function renderPage() {
  return renderRoutes([{ path: '/offers', element: <MyOffersPage /> }], '/offers')
}

test('toont eigen biedingen met richting, status en geldigheid', async () => {
  renderPage()
  const received = await screen.findByRole('region', { name: 'Ontvangen biedingen (3)' })
  const sent = screen.getByRole('region', { name: 'Verstuurde biedingen (3)' })
  expect(within(received).getByRole('heading', { name: 'Bod van daan' })).toBeInTheDocument()
  expect(within(received).getByText('Verlopen')).toBeInTheDocument()
  expect(within(received).getByText('Geaccepteerd')).toBeInTheDocument()
  expect(within(sent).getByText('Afgewezen')).toBeInTheDocument()
  expect(within(sent).getByText('Geannuleerd')).toBeInTheDocument()
  expect(within(sent).getAllByText('Je biedt aan')).toHaveLength(3)
  expect(within(received).getAllByText('Je ontvangt')).toHaveLength(3)
  expect(within(sent).getAllByRole('link', { name: 'Wingspan' })[0]).toHaveAttribute(
    'href',
    '/catalogue/9',
  )
  expect(screen.getAllByRole('article')).toHaveLength(6)
  expect(
    screen.queryByRole('button', { name: /Accepteren|Afwijzen|Annuleren/ }),
  ).not.toBeInTheDocument()
})

test('een lid zonder biedingen ziet beide lege toestanden', async () => {
  loginAs('m6')
  renderPage()
  expect(await screen.findByText('Je hebt nog geen biedingen ontvangen.')).toBeInTheDocument()
  expect(screen.getByText('Je hebt nog geen biedingen verstuurd.')).toBeInTheDocument()
  expect(screen.queryByRole('article')).not.toBeInTheDocument()
})

test('herstelt van een mislukte aanvraag met opnieuw proberen', async () => {
  server.use(
    http.get('/api/offers', () =>
      HttpResponse.json({ message: 'Biedingen ophalen mislukt.' }, { status: 503 }),
    ),
  )
  renderPage()
  expect(await screen.findByRole('alert')).toHaveTextContent('Biedingen ophalen mislukt.')
  server.resetHandlers()
  await userEvent.setup().click(screen.getByRole('button', { name: 'Opnieuw proberen' }))
  expect(await screen.findByRole('region', { name: 'Ontvangen biedingen (3)' })).toBeInTheDocument()
})
