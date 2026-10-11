import { http, HttpResponse, type HttpHandler } from 'msw'
import { getCurrentMember } from '../auth/mocks'
import { shelves } from './mockStore'
import { shelfSchema } from './shelfSchema'

let nextShelfId = 7
export const shelvesHandlers: HttpHandler[] = [
  http.get('/api/shelves', ({ request }) => {
    const me = getCurrentMember(request)
    if (!me) return HttpResponse.json({ message: 'Niet ingelogd' }, { status: 401 })
    return HttpResponse.json(shelves.filter((s) => s.ownerId === me.id))
  }),
  http.post('/api/shelves', async ({ request }) => {
    const me = getCurrentMember(request)
    if (!me) return HttpResponse.json({ message: 'Niet ingelogd' }, { status: 401 })
    const parsed = shelfSchema.safeParse(await request.json())
    if (!parsed.success)
      return HttpResponse.json({ message: parsed.error.issues[0].message }, { status: 400 })
    const created = { id: nextShelfId++, ownerId: me.id, ...parsed.data, recordIds: [] }
    shelves.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),
  http.put('/api/shelves/:id', async ({ request, params }) => {
    const me = getCurrentMember(request)
    if (!me) return HttpResponse.json({ message: 'Niet ingelogd' }, { status: 401 })
    const shelf = shelves.find((s) => s.id === Number(params.id) && s.ownerId === me.id)
    if (!shelf) return HttpResponse.json({ message: 'Plank niet gevonden' }, { status: 404 })
    const parsed = shelfSchema.safeParse(await request.json())
    if (!parsed.success)
      return HttpResponse.json({ message: parsed.error.issues[0].message }, { status: 400 })
    Object.assign(shelf, parsed.data)
    return HttpResponse.json(shelf)
  }),
  http.delete('/api/shelves/:id', ({ request, params }) => {
    const me = getCurrentMember(request)
    if (!me) return HttpResponse.json({ message: 'Niet ingelogd' }, { status: 401 })
    const index = shelves.findIndex((s) => s.id === Number(params.id) && s.ownerId === me.id)
    if (index < 0) return HttpResponse.json({ message: 'Plank niet gevonden' }, { status: 404 })
    shelves.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
