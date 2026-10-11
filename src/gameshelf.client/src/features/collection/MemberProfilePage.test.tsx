import { screen } from '@testing-library/react'
import { api } from '../../api/client'
import { loginAs, renderRoutes } from '../../test/utils'
import MemberProfilePage from './MemberProfilePage'

const routes = [{ path: '/members/:id', element: <MemberProfilePage /> }]

test('profiel van een ander toont alleen openbare planken en verlanglijstlink', async () => {
  loginAs('m2')
  renderRoutes(routes, '/members/m1')

  await screen.findByRole('heading', { name: 'sanne' })
  expect(screen.getByRole('link', { name: 'Favorieten' })).toHaveAttribute('href', '/shelves/1')
  expect(screen.queryByRole('link', { name: 'Voor later' })).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Verlanglijst van sanne' })).toHaveAttribute(
    'href',
    '/wishlists?member=m1',
  )
})

test('eigen profiel toont ook privé-planken met label', async () => {
  loginAs('m1')
  renderRoutes(routes, '/members/m1')

  await screen.findByRole('link', { name: 'Voor later' })
  expect(screen.getByText('Privé')).toBeInTheDocument()
})

test('mock API beschermt privé-planken, ook via directe URLs', async () => {
  loginAs('m2')
  const visible = (await api.get('/shelves?member=m1')).data
  expect(visible.map((s: { id: number }) => s.id)).toEqual([1])
  await expect(api.get('/shelves/2')).rejects.toMatchObject({ response: { status: 404 } })

  // Wingspan staat op beide planken en blijft via de openbare plank zichtbaar.
  expect((await api.get('/shelves/1')).data.records.map((r: { id: number }) => r.id)).toContain(2)

  loginAs('m1')
  expect((await api.get('/shelves?member=m1')).data).toHaveLength(2)
  expect((await api.get('/shelves/2')).data.isPublic).toBe(false)
})

test('onbekend lid krijgt een foutmelding', async () => {
  loginAs('m2')
  renderRoutes(routes, '/members/missing')
  expect(await screen.findByRole('alert')).toHaveTextContent('Lid niet gevonden')
})
