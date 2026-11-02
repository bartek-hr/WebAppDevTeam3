import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/server'
import { loginAs, renderRoutes } from '../../test/utils'
import WishlistsPage from './WishlistsPage'

const routes = [
  { path: '/wishlists', element: <WishlistsPage /> },
  { path: '/members/:id', element: <h1>Ledenprofiel</h1> },
]
beforeEach(() => loginAs('m1'))

test('toont wensen van meerdere leden met notities en vervulde status', async () => {
  renderRoutes(routes, '/wishlists')
  expect(await screen.findByText('6 van 6 wensen')).toBeInTheDocument()
  expect(screen.getByText('Voor onze volgende campagne.')).toBeInTheDocument()
  expect(screen.getByText('Vervuld')).toBeInTheDocument()
  expect(screen.getAllByText('Prioriteit 1')).toHaveLength(4)
  expect(screen.queryByRole('button', { name: /bod/i })).not.toBeInTheDocument()
})

test('combineert zoeken en lidfilter, bewaart filters bij heropenen en wist ze', async () => {
  const user = userEvent.setup()
  const { router, unmount } = renderRoutes(routes, '/wishlists')
  await screen.findByText('6 van 6 wensen')
  await user.type(screen.getByRole('searchbox'), ' WINGSpan ')
  expect(screen.getByText('2 van 6 wensen')).toBeInTheDocument()
  await user.selectOptions(screen.getByRole('combobox', { name: 'Lid' }), 'm2')
  expect(screen.getByText('1 van 6 wensen')).toBeInTheDocument()
  const path = router.state.location.pathname + router.state.location.search
  unmount()
  renderRoutes(routes, path)
  await screen.findByText('1 van 6 wensen')
  expect(screen.getByRole('combobox', { name: 'Lid' })).toHaveValue('m2')
  await user.selectOptions(screen.getByRole('combobox', { name: 'Lid' }), 'm1')
  expect(screen.getByText(/Geen wensen gevonden/)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Filters wissen' }))
  expect(screen.getByText('6 van 6 wensen')).toBeInTheDocument()
  expect(screen.getByRole('searchbox')).toHaveValue('')
})

test('opent lidfilter via profiel-URL en navigeert naar het lid', async () => {
  const user = userEvent.setup()
  const { router } = renderRoutes(routes, '/wishlists?member=m3')
  await screen.findByText('1 van 6 wensen')
  expect(screen.getByRole('combobox', { name: 'Lid' })).toHaveValue('m3')
  await user.click(screen.getByRole('link', { name: 'noor' }))
  expect(await screen.findByRole('heading', { name: 'Ledenprofiel' })).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/members/m3')
})

test('lid zonder wensen en onbekend lid tonen geen ongefilterde resultaten', async () => {
  const user = userEvent.setup()
  renderRoutes(routes, '/wishlists?member=missing')
  await screen.findByText('0 van 6 wensen')
  expect(screen.getByRole('combobox', { name: 'Lid' })).toHaveDisplayValue('Onbekend lid')
  await user.selectOptions(screen.getByRole('combobox', { name: 'Lid' }), 'm5')
  expect(screen.getByText(/Geen wensen gevonden/)).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Wingspan' })).not.toBeInTheDocument()
})

test('toont een lege lijst', async () => {
  server.use(http.get('/api/wishlists-preview', () => HttpResponse.json([])))
  renderRoutes(routes, '/wishlists')
  expect(
    await screen.findByText('Er staan nog geen games op de verlanglijsten.'),
  ).toBeInTheDocument()
})

test.each(['/api/wishlists-preview', '/api/members'])(
  'meldt fouten van %s en herstelt',
  async (endpoint) => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({ message: 'Tijdelijk niet beschikbaar' }, { status: 500 }),
      ),
    )
    const user = userEvent.setup()
    renderRoutes(routes, '/wishlists')
    expect(await screen.findByRole('alert')).toHaveTextContent('Tijdelijk niet beschikbaar')
    expect(screen.queryByText('6 van 6 wensen')).not.toBeInTheDocument()
    server.resetHandlers()
    await user.click(screen.getByRole('button', { name: 'Opnieuw proberen' }))
    expect(await screen.findByText('6 van 6 wensen')).toBeInTheDocument()
  },
)
