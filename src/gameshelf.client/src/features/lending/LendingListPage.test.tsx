import { screen, waitFor, within } from '@testing-library/react'
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

test('een lid biedt een doos aan die niet in zijn collectie hoeft te staan', async () => {
  const user = userEvent.setup()
  renderRoutes(routes, '/lending')

  await screen.findByText('8 van 8 dozen')
  await user.click(screen.getByRole('button', { name: 'Doos aanbieden' }))
  const dialog = await screen.findByRole('dialog', { name: 'Doos aanbieden' })
  await user.type(await within(dialog).findByRole('combobox'), 'patchwork')
  await user.click(within(dialog).getByRole('option', { name: /Patchwork/ }))
  await user.type(within(dialog).getByLabelText('Staat van de doos'), 'Compleet, nooit gespeeld')
  await user.click(within(dialog).getByRole('button', { name: 'Aanbieden' }))

  expect(await screen.findByText('9 van 9 dozen')).toBeInTheDocument()
  const newBox = await findBoxCard('Patchwork')
  expect(within(newBox).getByText('Compleet, nooit gespeeld')).toBeInTheDocument()
  expect(await within(newBox).findByText('Eigenaar: daan')).toBeInTheDocument()
})

test('doos aanbieden zonder game en staat toont meldingen', async () => {
  const user = userEvent.setup()
  renderRoutes(routes, '/lending')

  await user.click(await screen.findByRole('button', { name: 'Doos aanbieden' }))
  const dialog = await screen.findByRole('dialog', { name: 'Doos aanbieden' })
  await user.click(within(dialog).getByRole('button', { name: 'Aanbieden' }))

  expect(await within(dialog).findByText('Kies een game')).toBeInTheDocument()
  expect(within(dialog).getByText('Beschrijf de staat van de doos')).toBeInTheDocument()
})

test('een lid past de staat van zijn eigen doos aan', async () => {
  const user = userEvent.setup()
  renderRoutes(routes, '/lending')

  const ownBox = await findBoxCard('7 Wonders Duel')
  await user.click(within(ownBox).getByRole('button', { name: 'Bewerken' }))
  const dialog = await screen.findByRole('dialog', { name: 'Doos bewerken' })
  expect(
    within(dialog).getByDisplayValue('7 Wonders Duel (Repos Production, 2015)'),
  ).toBeInTheDocument()
  const condition = within(dialog).getByLabelText('Staat van de doos')
  await user.clear(condition)
  await user.type(condition, 'Compleet, één kaart beschadigd')
  await user.click(within(dialog).getByRole('button', { name: 'Opslaan' }))

  expect(await within(ownBox).findByText('Compleet, één kaart beschadigd')).toBeInTheDocument()
  expect(screen.getByText('8 van 8 dozen')).toBeInTheDocument()
})

test('alleen bij eigen dozen staan knoppen om ze aan te passen', async () => {
  renderRoutes(routes, '/lending')

  const otherBox = await findBoxCard('Gloomhaven')
  expect(within(otherBox).queryByRole('button', { name: 'Bewerken' })).not.toBeInTheDocument()
  expect(
    within(otherBox).queryByRole('button', { name: 'Van de lijst halen' }),
  ).not.toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: 'Bewerken' })).toHaveLength(2)
})

test('een uitgeleende eigen doos kan niet worden aangepast', async () => {
  loginAs('m4')
  renderRoutes(routes, '/lending')

  const cousinBox = await findBoxCard('Pandemic Legacy: Season 1')
  expect(await within(cousinBox).findByRole('button', { name: 'Bewerken' })).toBeDisabled()
  expect(within(cousinBox).getByRole('button', { name: 'Van de lijst halen' })).toBeDisabled()
  expect(within(cousinBox).getByText('Kan niet zolang de doos is uitgeleend')).toBeInTheDocument()

  const availableBox = await findBoxCard('Twilight Imperium (4e editie)')
  expect(within(availableBox).getByRole('button', { name: 'Bewerken' })).toBeEnabled()
})

test('een lid haalt zijn eigen doos van de lijst na bevestigen', async () => {
  const user = userEvent.setup()
  renderRoutes(routes, '/lending')

  const ownBox = await findBoxCard('7 Wonders Duel')
  await user.click(within(ownBox).getByRole('button', { name: 'Van de lijst halen' }))
  const dialog = await screen.findByRole('dialog', { name: 'Doos van de lijst halen' })
  await user.click(within(dialog).getByRole('button', { name: 'Van de lijst halen' }))

  expect(await screen.findByText('7 van 7 dozen')).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: '7 Wonders Duel' })).not.toBeInTheDocument()
})

test('annuleren laat de doos op de lijst staan', async () => {
  const user = userEvent.setup()
  renderRoutes(routes, '/lending')

  const ownBox = await findBoxCard('7 Wonders Duel')
  await user.click(within(ownBox).getByRole('button', { name: 'Van de lijst halen' }))
  const dialog = await screen.findByRole('dialog', { name: 'Doos van de lijst halen' })
  await user.click(within(dialog).getByRole('button', { name: 'Annuleren' }))

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(screen.getByText('8 van 8 dozen')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '7 Wonders Duel' })).toBeInTheDocument()
})
