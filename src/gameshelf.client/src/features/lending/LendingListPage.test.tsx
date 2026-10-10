import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { loginAs, renderRoutes } from '../../test/utils'
import LendingListPage from './LendingListPage'
import { resetLendingMocks } from './mocks'

const routes = [{ path: '/lending', element: <LendingListPage /> }]

beforeEach(() => {
  resetLendingMocks()
  loginAs('m2')
})

async function findBoxCard(title: string) {
  const link = await screen.findByRole('link', { name: title })
  return link.closest<HTMLElement>('.card')!
}

test('toont alle dozen, ook de uitgeleende doos bij de neef', async () => {
  renderRoutes(routes, '/lending')

  expect(await screen.findByText('8 van 8 dozen')).toBeInTheDocument()
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(8)
  const cousinBox = await findBoxCard('Pandemic Legacy: Season 1')
  expect(within(cousinBox).getByText('uitgeleend')).toBeInTheDocument()
})

test('toont de eigenaar en de staat van een doos', async () => {
  renderRoutes(routes, '/lending')

  const cousinBox = await findBoxCard('Pandemic Legacy: Season 1')
  expect(await within(cousinBox).findByText('Eigenaar: thijs')).toBeInTheDocument()
  expect(within(cousinBox).getByText('Kaarten gesleeved, één stickervel mist')).toBeInTheDocument()
})

test('zoeken op titel filtert de dozen', async () => {
  const user = userEvent.setup()
  renderRoutes(routes, '/lending')

  await user.type(await screen.findByLabelText('Zoek op titel'), 'catan')

  expect(await screen.findByText('1 van 8 dozen')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Catan' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Gloomhaven' })).not.toBeInTheDocument()
})

test('alleen beschikbaar verbergt de uitgeleende dozen', async () => {
  const user = userEvent.setup()
  renderRoutes(routes, '/lending')

  await screen.findByText('8 van 8 dozen')
  await user.click(screen.getByLabelText('Alleen beschikbaar'))

  expect(await screen.findByText('4 van 8 dozen')).toBeInTheDocument()
  expect(screen.queryByText('uitgeleend')).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Pandemic Legacy: Season 1' })).not.toBeInTheDocument()
})

test('filters wissen toont weer alle dozen', async () => {
  const user = userEvent.setup()
  renderRoutes(routes, '/lending?q=bestaatniet&available=1')

  expect(await screen.findByText(/Geen dozen gevonden/)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Filters wissen' }))

  expect(await screen.findByText('8 van 8 dozen')).toBeInTheDocument()
})
