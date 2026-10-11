import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { api } from '../../api/client'
import { loginAs, renderRoutes } from '../../test/utils'
import { collectionRecords } from '../collection/mocks'
import { shelves } from './mockStore'
import ShelfDetailPage from './ShelfDetailPage'

const initial = structuredClone(shelves)

beforeEach(() => shelves.splice(0, shelves.length, ...structuredClone(initial)))

test('eigen collectie toevoegen en verwijderen zonder andere plank of collectie te wijzigen', async () => {
  loginAs('m2')
  const user = userEvent.setup()
  renderRoutes([{ path: '/shelves/:id', element: <ShelfDetailPage /> }], '/shelves/4')

  const select = await screen.findByLabelText('Game uit mijn collectie')
  const record = collectionRecords.find((r) => r.id === 9)!
  expect(screen.queryByRole('option', { name: /Wingspan/ })).not.toBeInTheDocument()
  expect(screen.queryByRole('option', { name: /Codenames/ })).not.toBeInTheDocument()

  await user.selectOptions(select, '9')
  await user.click(screen.getByRole('button', { name: 'Toevoegen aan plank' }))
  await screen.findByRole('link', { name: record.game.title })

  expect(shelves.find((s) => s.id === 4)!.recordIds).toContain(9)

  expect(shelves.find((s) => s.id === 5)!.recordIds).toContain(9)

  await user.click(screen.getByRole('button', { name: `Haal ${record.game.title} van plank` }))
  await waitFor(() =>
    expect(screen.queryByRole('link', { name: record.game.title })).not.toBeInTheDocument(),
  )

  expect(shelves.find((s) => s.id === 5)!.recordIds).toContain(9)
  expect(collectionRecords.find((r) => r.id === 9)).toBeDefined()
})

test('mock API weigert dubbele games, andere collecties en andere eigenaren', async () => {
  loginAs('m2')
  await expect(api.post('/shelves/4/records', { recordId: 8 })).rejects.toMatchObject({
    response: { status: 409 },
  })
  await expect(api.post('/shelves/4/records', { recordId: 1 })).rejects.toMatchObject({
    response: { status: 400 },
  })
  await expect(api.post('/shelves/1/records', { recordId: 8 })).rejects.toMatchObject({
    response: { status: 404 },
  })
  await expect(api.delete('/shelves/1/records/1')).rejects.toMatchObject({
    response: { status: 404 },
  })
  await expect(api.get('/shelves/2')).rejects.toMatchObject({ response: { status: 404 } })
  expect((await api.get('/shelves/1')).data.records).toHaveLength(3)
})
