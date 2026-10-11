import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { loginAs, renderRoutes } from '../../test/utils'
import CollectionPage from './CollectionPage'

const routes = [{ path: '/collection', element: <CollectionPage /> }]

test('toont alleen de collectie van het ingelogde lid', async () => {
  loginAs('m2')
  renderRoutes(routes, '/collection')

  expect(await screen.findByRole('link', { name: 'Gloomhaven' })).toBeInTheDocument()
  // Wingspan is van sanne (m1)
  expect(screen.queryByRole('link', { name: 'Wingspan' })).not.toBeInTheDocument()
})

test('waarschuwt als het maximum aan campagnes bereikt is', async () => {
  loginAs('m2')
  renderRoutes(routes, '/collection')

  expect(await screen.findByText('3 van 3 campagnes bezig')).toBeInTheDocument()
  expect(screen.getByText(/maak eerst een campagne af/i)).toBeInTheDocument()
})

test('telt de campagnes van een ander lid apart', async () => {
  loginAs('m3')
  renderRoutes(routes, '/collection')

  expect(await screen.findByText('1 van 3 campagnes bezig')).toBeInTheDocument()
  expect(screen.queryByText(/maak eerst een campagne af/i)).not.toBeInTheDocument()
})

test('filtert op status en zoekt op titel', async () => {
  const user = userEvent.setup()
  loginAs('m2')
  renderRoutes(routes, '/collection')
  await screen.findByRole('link', { name: 'Gloomhaven' })

  await user.selectOptions(screen.getByLabelText('Status'), 'InProgress')
  const rows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1)
  expect(rows()).toHaveLength(3)

  await user.type(screen.getByLabelText('Zoek op titel'), 'pandemic')
  expect(rows()).toHaveLength(1)
  expect(screen.getByRole('link', { name: 'Pandemic Legacy: Season 1' })).toBeInTheDocument()

  await user.type(screen.getByLabelText('Zoek op titel'), 'xyz')
  expect(screen.getByText('Geen games gevonden met deze filters.')).toBeInTheDocument()
})
