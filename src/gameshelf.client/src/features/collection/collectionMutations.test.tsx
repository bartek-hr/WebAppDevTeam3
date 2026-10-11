import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { api } from '../../api/client'
import { loginAs, renderRoutes } from '../../test/utils'
import { shelves } from '../shelves/mockStore'
import CollectionPage from './CollectionPage'
import { collectionRecords } from './mocks'
const initial = structuredClone(collectionRecords)
beforeEach(() => collectionRecords.splice(0, collectionRecords.length, ...structuredClone(initial)))
afterEach(() => shelves.splice(0, shelves.length))
test('toevoegen, duplicaten weigeren en verwijderen van planken', async () => {
  loginAs('m2')
  const user = userEvent.setup()
  renderRoutes([{ path: '/collection', element: <CollectionPage /> }], '/collection')
  await screen.findByRole('link', { name: 'Gloomhaven' })
  await user.click(screen.getByRole('button', { name: 'Game toevoegen' }))
  await user.type(await screen.findByRole('combobox', { name: 'Game' }), 'Wingspan')
  await user.click(await screen.findByRole('option', { name: /Wingspan/ }))
  await user.click(screen.getByRole('button', { name: 'Toevoegen' }))
  await screen.findByRole('link', { name: 'Wingspan' })
  const added = collectionRecords.find((r) => r.ownerId === 'm2' && r.game.title === 'Wingspan')!
  expect(added).toMatchObject({ status: 'NotPlayed', plays: 0 })
  await expect(api.post('/collection', { gameId: added.game.id })).rejects.toMatchObject({
    response: { status: 409 },
  })
  shelves.push({
    id: 100,
    ownerId: 'm2',
    name: 'Favorieten',
    description: '',
    isPublic: false,
    recordIds: [added.id],
  })
  await user.click(screen.getByRole('button', { name: 'Verwijder Wingspan' }))
  const dialog = await screen.findByRole('dialog')
  await within(dialog).findByText(/Favorieten/)
  await user.click(within(dialog).getByRole('button', { name: 'Verwijderen' }))
  await screen.findByText('7 van 7 games')
  expect(screen.queryByRole('link', { name: 'Wingspan' })).not.toBeInTheDocument()
  expect(shelves[0].recordIds).toEqual([])
})
test('verwijdert geen record van een ander lid', async () => {
  loginAs('m3')
  await expect(api.delete('/collection/5')).rejects.toMatchObject({ response: { status: 404 } })
  expect(collectionRecords.find((r) => r.id === 5)).toBeDefined()
})
