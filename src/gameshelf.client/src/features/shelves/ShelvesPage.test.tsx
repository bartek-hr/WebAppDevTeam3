import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { api } from '../../api/client'
import { loginAs, renderRoutes } from '../../test/utils'
import { collectionRecords } from '../collection/mocks'
import { shelves } from './mockStore'
import ShelvesPage from './ShelvesPage'

const initial = structuredClone(shelves)

beforeEach(() => shelves.splice(0, shelves.length, ...structuredClone(initial)))

test('eigen planken tonen, valideren, aanmaken, bewerken en verwijderen', async () => {
  loginAs('m2')
  const user = userEvent.setup()
  renderRoutes([{ path: '/shelves', element: <ShelvesPage /> }], '/shelves')

  await screen.findByRole('link', { name: 'Campagnes' })
  expect(screen.queryByRole('link', { name: 'Voor twee' })).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Plank aanmaken' }))
  await user.click(screen.getByRole('button', { name: 'Opslaan' }))
  await screen.findByText('Geef je plank een naam.')

  await user.type(screen.getByLabelText('Naam'), 'Voor vrijdag')
  await user.type(screen.getByLabelText('Beschrijving'), 'Met vrienden')
  await user.click(screen.getByLabelText('Openbaar'))
  await user.click(screen.getByRole('button', { name: 'Opslaan' }))
  await screen.findByRole('link', { name: 'Voor vrijdag' })

  await user.click(screen.getByRole('button', { name: 'Bewerk Voor vrijdag' }))
  await user.clear(screen.getByLabelText('Naam'))
  await user.type(screen.getByLabelText('Naam'), 'Voor zaterdag')
  await user.click(screen.getByRole('button', { name: 'Opslaan' }))
  await screen.findByRole('link', { name: 'Voor zaterdag' })

  const before = structuredClone(collectionRecords)
  await user.click(screen.getByRole('button', { name: 'Verwijder Campagnes' }))
  const dialog = screen.getByRole('dialog')
  expect(within(dialog).getByText(/games blijven in je collectie/)).toBeInTheDocument()
  await user.click(within(dialog).getByRole('button', { name: 'Verwijderen' }))
  await screen.findByRole('link', { name: 'Voor zaterdag' })

  expect(collectionRecords).toEqual(before)
})

test('mock API weigert ongeldige gegevens en wijzigingen van anderen', async () => {
  loginAs('m2')
  await expect(
    api.post('/shelves', { name: ' ', description: '', isPublic: false }),
  ).rejects.toMatchObject({ response: { status: 400 } })
  await expect(
    api.put('/shelves/1', { name: 'Hacked', description: '', isPublic: true }),
  ).rejects.toMatchObject({ response: { status: 404 } })
  await expect(api.delete('/shelves/1')).rejects.toMatchObject({ response: { status: 404 } })
  expect(shelves.find((s) => s.id === 1)?.name).toBe('Favorieten')
})
