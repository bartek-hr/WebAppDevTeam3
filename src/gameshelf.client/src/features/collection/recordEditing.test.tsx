import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { api } from '../../api/client'
import { loginAs, renderRoutes } from '../../test/utils'
import CollectionPage from './CollectionPage'
import { collectionRecords } from './mocks'

const initial = structuredClone(collectionRecords)

beforeEach(() => collectionRecords.splice(0, collectionRecords.length, ...structuredClone(initial)))

test('eerste keer spelen, daarna beoordelen en notitie opslaan', async () => {
  loginAs('m2')
  const user = userEvent.setup()
  renderRoutes([{ path: '/collection', element: <CollectionPage /> }], '/collection')

  await screen.findByRole('link', { name: 'Azul' })

  await user.click(screen.getByRole('button', { name: 'Bewerk Azul' }))
  let dialog = screen.getByRole('dialog')
  expect(within(dialog).getByLabelText('Beoordeling')).toBeDisabled()
  expect(within(dialog).getByRole('option', { name: 'Bezig' })).toBeDisabled()
  await user.click(within(dialog).getByRole('button', { name: 'Annuleren' }))

  await user.click(screen.getByRole('button', { name: '+1 gespeeld: Azul' }))
  const row = screen.getByRole('link', { name: 'Azul' }).closest('tr')!
  await within(row).findByText('1×')
  expect(within(row).getByText('Gespeeld')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Bewerk Azul' }))
  dialog = screen.getByRole('dialog')
  await user.selectOptions(within(dialog).getByLabelText('Beoordeling'), '4')
  await user.type(within(dialog).getByLabelText('Notitie'), 'Een tegel kwijt')
  await user.click(within(dialog).getByRole('button', { name: 'Opslaan' }))
  await screen.findByText('Een tegel kwijt')
  expect(within(row).getByText('4 van 5 sterren')).toBeInTheDocument()
})

test('mock API bewaakt aantal, campagnes, beoordeling en eigendom', async () => {
  loginAs('m2')
  const record = collectionRecords.find((r) => r.ownerId === 'm2' && r.plays === 0)!
  const url = `/collection/${record.id}`

  await expect(api.put(url, { status: 'InProgress', plays: 0 })).rejects.toMatchObject({
    response: { status: 400 },
  })
  await expect(api.put(url, { status: 'NotPlayed', plays: 0, rating: 4 })).rejects.toMatchObject({
    response: { status: 400 },
  })

  const first = await api.put(url, { status: 'InProgress', plays: 1 })
  expect(first.data.status).toBe('Played')
  await expect(api.put(url, { status: 'Played', plays: 0 })).rejects.toMatchObject({
    response: { status: 400 },
  })
  await expect(api.put(url, { status: 'Played', plays: 1, rating: 6 })).rejects.toMatchObject({
    response: { status: 400 },
  })

  loginAs('m3')
  await expect(api.put(url, { status: 'Played', plays: 2 })).rejects.toMatchObject({
    response: { status: 404 },
  })
})

test('wist een beoordeling en verwijdert deze bij een andere status', async () => {
  loginAs('m3')
  const url = '/collection/13'
  const cleared = await api.put(url, { status: 'Played', plays: 19 })
  expect(cleared.data.rating).toBeUndefined()

  await api.put(url, { status: 'Played', plays: 19, rating: 5 })
  const changed = await api.put(url, { status: 'InProgress', plays: 19 })
  expect(changed.data.status).toBe('InProgress')
  expect(changed.data.rating).toBeUndefined()
})
