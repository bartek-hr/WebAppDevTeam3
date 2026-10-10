import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { loginAs, renderRoutes } from '../../test/utils'
import AddGamePage from './AddGamePage'
import GameDetailPage from './GameDetailPage'

const routes = [
  { path: '/catalogue/new', element: <AddGamePage /> },
  { path: '/catalogue/:id', element: <GameDetailPage /> },
]

beforeEach(() => loginAs('m2'))

test('toont meldingen bij lege velden', async () => {
  const user = userEvent.setup()
  renderRoutes(routes, '/catalogue/new')

  await user.click(screen.getByRole('button', { name: 'Toevoegen' }))

  expect(await screen.findByText('Vul een titel in')).toBeInTheDocument()
  expect(screen.getByText('Vul de speelduur in')).toBeInTheDocument()
})

test('waarschuwt voor een editie die al in de catalogus staat', async () => {
  const user = userEvent.setup()
  renderRoutes(routes, '/catalogue/new')

  await user.type(screen.getByLabelText('Titel'), 'Catan')
  await user.type(screen.getByLabelText('Uitgever'), '999 Games')
  await user.type(screen.getByLabelText('Jaar van uitgave'), '1995')

  expect(await screen.findByText(/Deze editie staat al in de catalogus/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Toevoegen' })).toBeDisabled()
})

test('voegt een nieuwe game toe en opent de detailpagina', async () => {
  const user = userEvent.setup()
  renderRoutes(routes, '/catalogue/new')

  await user.type(screen.getByLabelText('Titel'), 'Brass: Birmingham')
  await user.type(screen.getByLabelText('Uitgever'), 'Roxley')
  await user.type(screen.getByLabelText('Jaar van uitgave'), '2018')
  await user.type(screen.getByLabelText('Categorie'), 'Strategie')
  await user.type(screen.getByLabelText('Speelduur (minuten)'), '120')
  await user.type(screen.getByLabelText('Min. spelers'), '2')
  await user.type(screen.getByLabelText('Max. spelers'), '4')
  await user.click(screen.getByRole('button', { name: 'Toevoegen' }))

  expect(await screen.findByRole('heading', { name: 'Brass: Birmingham' })).toBeInTheDocument()
  expect(screen.getByText('2–4 spelers')).toBeInTheDocument()
})
