import { http, HttpResponse, type HttpHandler } from 'msw'
import type { CollectionRecord, RecordStatus } from '../../types'
import { getCurrentMember } from '../auth/mocks'
import { recordSchema, validateRecordUpdate } from './recordSchema'
import { shelves } from '../shelves/mockStore'
import { games } from '../catalogue/mocks'

const record = (
  ownerId: string,
  gameId: number,
  status: RecordStatus,
  plays: number,
  rating?: number,
  note?: string,
): Omit<CollectionRecord, 'id'> => {
  const game = games.find((g) => g.id === gameId)
  if (!game) throw new Error(`Mockgame ${gameId} bestaat niet`)
  return { ownerId, game, status, plays, rating, note }
}

// Eigenaar: Joran. Collectie-records van de mockleden (id's uit auth/mocks.ts en catalogue/mocks.ts).
// Planken (shelves/mocks.ts) verwijzen naar de record-id's.
// daan (m2) zit op het maximum van 3 campagnes, noor (m3) heeft er 1.
export const collectionRecords: CollectionRecord[] = [
  // sanne (m1)
  record('m1', 1, 'Played', 23, 4, 'Uitbreiding 5-6 spelers zit in de doos.'),
  record('m1', 9, 'Played', 8, 5),
  record('m1', 14, 'Played', 11, 4, 'Twee konijnen-pionnen kwijt, vervangen door knopen.'),
  record('m1', 17, 'NotPlayed', 0, undefined, 'Nog op zoek naar een vrije zaterdag.'),
  // daan (m2)
  record('m2', 2, 'InProgress', 14, undefined, 'Campagne met de dinsdaggroep, scenario 21.'),
  record('m2', 6, 'InProgress', 7, undefined, 'Legacy: niet zelf de doos openen!'),
  record('m2', 8, 'InProgress', 3),
  record('m2', 3, 'Played', 30, 5, 'Huisregel: de spymaster mag één keer per potje passen.'),
  record('m2', 12, 'Played', 6, 3),
  record('m2', 15, 'NotPlayed', 0),
  record('m2', 11, 'Played', 12, 4, 'Uitbreiding Kroegen & Kathedralen erbij.'),
  // noor (m3)
  record('m3', 7, 'InProgress', 2, undefined, 'Pas te beginnen als season 1 uit is.'),
  record('m3', 13, 'Played', 19, 5),
  record('m3', 10, 'Played', 4, 3, 'Één trein ontbreekt (blauw).'),
  record('m3', 16, 'NotPlayed', 0),
  // thijs (m4)
  record('m4', 5, 'Played', 2, 2, 'Engelse editie, regelboekje zit los.'),
  record('m4', 4, 'NotPlayed', 0),
].map((data, index) => ({ id: index + 1, ...data }))

let nextRecordId = collectionRecords.length + 1

export const collectionHandlers: HttpHandler[] = [
  http.put('/api/collection/:id', async ({ request, params }) => {
    const me = getCurrentMember(request)
    if (!me) return HttpResponse.json({ message: 'Niet ingelogd' }, { status: 401 })
    const current = collectionRecords.find((r) => r.id === Number(params.id) && r.ownerId === me.id)
    if (!current) return HttpResponse.json({ message: 'Record niet gevonden' }, { status: 404 })
    const parsed = recordSchema.safeParse(await request.json())
    if (!parsed.success)
      return HttpResponse.json(
        { message: 'Controleer status, aantal, beoordeling en notitie.' },
        { status: 400 },
      )
    const message = validateRecordUpdate(current, parsed.data, collectionRecords)
    if (message) return HttpResponse.json({ message }, { status: 400 })
    const status = current.plays === 0 && parsed.data.plays > 0 ? 'Played' : parsed.data.status
    Object.assign(current, {
      ...parsed.data,
      status,
      rating: parsed.data.rating,
      note: parsed.data.note,
    })
    return HttpResponse.json(current)
  }),
  http.post('/api/collection', async ({ request }) => {
    const me = getCurrentMember(request)
    if (!me) return HttpResponse.json({ message: 'Niet ingelogd' }, { status: 401 })
    const { gameId } = (await request.json()) as { gameId: number }
    const game = games.find((g) => g.id === gameId)
    if (!game) return HttpResponse.json({ message: 'Kies een bestaande game.' }, { status: 400 })
    if (collectionRecords.some((r) => r.ownerId === me.id && r.game.id === gameId)) {
      return HttpResponse.json({ message: 'Deze game staat al in je collectie.' }, { status: 409 })
    }
    const created: CollectionRecord = {
      id: nextRecordId++,
      ownerId: me.id,
      game,
      status: 'NotPlayed',
      plays: 0,
    }
    collectionRecords.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),
  http.get('/api/collection/:id/shelves', ({ request, params }) => {
    const me = getCurrentMember(request)
    if (!me) return HttpResponse.json({ message: 'Niet ingelogd' }, { status: 401 })
    const owned = collectionRecords.find((r) => r.id === Number(params.id) && r.ownerId === me.id)
    if (!owned) return HttpResponse.json({ message: 'Record niet gevonden' }, { status: 404 })
    return HttpResponse.json(
      shelves.filter((s) => s.ownerId === me.id && s.recordIds.includes(owned.id)),
    )
  }),
  http.delete('/api/collection/:id', ({ request, params }) => {
    const me = getCurrentMember(request)
    if (!me) return HttpResponse.json({ message: 'Niet ingelogd' }, { status: 401 })
    const index = collectionRecords.findIndex(
      (r) => r.id === Number(params.id) && r.ownerId === me.id,
    )
    if (index < 0) return HttpResponse.json({ message: 'Record niet gevonden' }, { status: 404 })
    const [removed] = collectionRecords.splice(index, 1)
    for (const shelf of shelves) shelf.recordIds = shelf.recordIds.filter((id) => id !== removed.id)
    return new HttpResponse(null, { status: 204 })
  }),
  // De collectie van het ingelogde lid
  http.get('/api/collection', ({ request }) => {
    const me = getCurrentMember(request)
    if (!me) return HttpResponse.json({ message: 'Niet ingelogd' }, { status: 401 })
    return HttpResponse.json(collectionRecords.filter((r) => r.ownerId === me.id))
  }),
]
