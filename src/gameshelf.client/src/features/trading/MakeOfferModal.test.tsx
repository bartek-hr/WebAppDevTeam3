import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { loginAs, renderRoutes } from '../../test/utils'
import type { WishlistItem } from '../../types'
import { games } from '../catalogue/mocks'
import MakeOfferModal from './MakeOfferModal'
import { offers, resetTradingMocks } from './mocks'

// Er zijn nog geen verlanglijst-mocks, dus een eigen item: noor (m3) zoekt Wingspan
const wishlistItem: WishlistItem = {
  id: 1,
  ownerId: 'm3',
  game: games.find((game) => game.title === 'Wingspan')!,
  priority: 1,
  note: 'Graag met de Europese uitbreiding',
  isFulfilled: false,
}

function renderModal(item: WishlistItem, onClose = vi.fn()) {
  renderRoutes([{ path: '/', element: <MakeOfferModal wishlistItem={item} onClose={onClose} /> }])
  return onClose
}

beforeEach(() => {
  resetTradingMocks()
  loginAs('m2')
})

test('toont de gezochte game, het lid en de opmerking', async () => {
  renderModal(wishlistItem)

  expect(await screen.findByText('noor')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Wingspan' })).toBeInTheDocument()
  expect(screen.getByText('Stonemaier Games, 2019')).toBeInTheDocument()
  expect(screen.getByText(/Graag met de Europese uitbreiding/)).toBeInTheDocument()
})

test('toont geen formulier bij je eigen verlanglijst-item', async () => {
  renderModal({ ...wishlistItem, ownerId: 'm2' })

  expect(await screen.findByText('Dit is je eigen verlanglijst-item.')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Bod doen' })).not.toBeInTheDocument()
})

test('toont geen formulier bij een vervuld item', () => {
  renderModal({ ...wishlistItem, isFulfilled: true })

  expect(
    screen.getByText('Dit item is al vervuld en neemt geen biedingen meer aan.'),
  ).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Bod doen' })).not.toBeInTheDocument()
})

test('toont een melding als er geen game gekozen is', async () => {
  const user = userEvent.setup()
  const onClose = renderModal(wishlistItem)

  await user.click(screen.getByRole('button', { name: 'Bod doen' }))

  expect(await screen.findByText('Kies de game die je terugvraagt')).toBeInTheDocument()
  expect(onClose).not.toHaveBeenCalled()
})

test('doet een bod en sluit de modal', async () => {
  const user = userEvent.setup()
  const onClose = renderModal(wishlistItem)

  const picker = await screen.findByRole('combobox', { name: 'Welke game vraag je terug?' })
  await user.type(picker, 'azul')
  await user.click(screen.getByRole('option', { name: /Azul/ }))
  await user.click(screen.getByRole('button', { name: 'Bod doen' }))

  await vi.waitFor(() => expect(onClose).toHaveBeenCalled())
  expect(offers).toEqual([
    expect.objectContaining({
      wishlistItemId: 1,
      offeredById: 'm2',
      askedGame: expect.objectContaining({ title: 'Azul' }),
      status: 'Open',
    }),
  ])
})
