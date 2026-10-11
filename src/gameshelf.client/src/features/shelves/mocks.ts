import { http, HttpResponse, type HttpHandler } from 'msw'
import { getCurrentMember, members } from '../auth/mocks'
import { collectionRecords } from '../collection/mocks'
import { shelves } from './mockStore'
import { shelfSchema } from './shelfSchema'

let nextShelfId = 7

export const shelvesHandlers: HttpHandler[] = [
  http.get('/api/shelves/:id', ({ request, params }) => {
    const me = getCurrentMember(request)
    if (!me) return HttpResponse.json({ message: 'Niet ingelogd' }, { status: 401 })
    const shelf = shelves.find(
      (s) => s.id === Number(params.id) && (s.ownerId === me.id || s.isPublic),
    )
    if (!shelf) return HttpResponse.json({ message: 'Plank niet gevonden' }, { status: 404 })
    return HttpResponse.json({
      ...shelf,
      records: collectionRecords.filter(
        (r) => r.ownerId === shelf.ownerId && shelf.recordIds.includes(r.id),
      ),
    })
  }),
  http.post('/api/shelves/:id/records', async ({ request, params }) => {
    const me = getCurrentMember(request)
    if (!me) return HttpResponse.json({ message: 'Niet ingelogd' }, { status: 401 })
    const shelf = shelves.find((s) => s.id === Number(params.id) && s.ownerId === me.id)
    if (!shelf) return HttpResponse.json({ message: 'Plank niet gevonden' }, { status: 404 })
    const { recordId } = (await request.json()) as { recordId: number }
    const record = collectionRecords.find((r) => r.id === recordId && r.ownerId === me.id)
    if (!record)
      return HttpResponse.json(
        { message: 'Kies een game uit je eigen collectie.' },
        { status: 400 },
      )
    if (shelf.recordIds.includes(recordId))
      return HttpResponse.json({ message: 'Deze game staat al op de plank.' }, { status: 409 })
    shelf.recordIds.push(recordId)
    return HttpResponse.json(shelf)
  }),
  http.delete('/api/shelves/:id/records/:recordId', ({ request, params }) => {
    const me = getCurrentMember(request)
    if (!me) return HttpResponse.json({ message: 'Niet ingelogd' }, { status: 401 })
    const shelf = shelves.find((s) => s.id === Number(params.id) && s.ownerId === me.id)
    if (!shelf) return HttpResponse.json({ message: 'Plank niet gevonden' }, { status: 404 })
    if (!shelf.recordIds.includes(Number(params.recordId)))
      return HttpResponse.json({ message: 'Game staat niet op deze plank.' }, { status: 404 })
    shelf.recordIds = shelf.recordIds.filter((id) => id !== Number(params.recordId))
    return new HttpResponse(null, { status: 204 })
  }),
  http.get('/api/shelves', ({ request }) => {
    const me = getCurrentMember(request)
    if (!me) return HttpResponse.json({ message: 'Niet ingelogd' }, { status: 401 })
    const ownerId = new URL(request.url).searchParams.get('member') ?? me.id
    if (!members.some((member) => member.id === ownerId))
      return HttpResponse.json({ message: 'Lid niet gevonden' }, { status: 404 })
    return HttpResponse.json(
      shelves.filter((s) => s.ownerId === ownerId && (s.isPublic || s.ownerId === me.id)),
    )
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
