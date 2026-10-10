import { http, HttpResponse } from 'msw'
import type { HttpHandler } from 'msw'

export type Session = {
  id: number
  title: string
  date: string
  location: string
  capacity: number
  registered: number
}

// Shared mock data for all handlers
export const sessions: Session[] = [
  {
    id: 1,
    title: 'Spelavond',
    date: '2026-10-15',
    location: 'clubruimte',
    capacity: 10,
    registered: 0,
  },
  {
    id: 2,
    title: 'Dungeons & Dragons',
    date: '2026-10-18',
    location: 'thuis',
    capacity: 10,
    registered: 1,
  },
  {
    id: 3,
    title: 'Pokeravond',
    date: '2026-10-20',
    location: 'clubruimte',
    capacity: 10,
    registered: 9,
  },
]

export const sessionsHandlers: HttpHandler[] = [
  // GET all sessions
  http.get('/api/sessions', () => {
    return HttpResponse.json(sessions)
  }),

  // GET one session
  http.get('/api/sessions/:id', ({ params }) => {
    const session = sessions.find(
      (s) => s.id === Number(params.id),
    )

    if (!session) {
      return HttpResponse.json(
        { message: 'Session not found' },
        { status: 404 },
      )
    }

    return HttpResponse.json(session)
  }),

  // UPDATE an existing session
  http.put('/api/sessions/:id', async ({ params, request }) => {
    const id = Number(params.id)
    const index = sessions.findIndex((s) => s.id === id)

    if (index === -1) {
      return HttpResponse.json(
        { message: 'Session not found' },
        { status: 404 },
      )
    }

    let updates: Partial<Session>

    try {
      updates = (await request.json()) as Partial<Session>
    } catch {
      return HttpResponse.json(
        { message: 'Invalid request body' },
        { status: 400 },
      )
    }

    // Validate the submitted data
    if (
      typeof updates.title !== 'string' ||
      typeof updates.date !== 'string' ||
      typeof updates.location !== 'string' ||
      typeof updates.capacity !== 'number' ||
      typeof updates.registered !== 'number'
    ) {
      return HttpResponse.json(
        { message: 'Invalid session data' },
        { status: 400 },
      )
    }

    if (
      !updates.title.trim() ||
      !updates.location.trim() ||
      !Number.isFinite(updates.capacity) ||
      !Number.isFinite(updates.registered) ||
      updates.capacity < 1 ||
      updates.registered < 0 ||
      updates.registered > updates.capacity
    ) {
      return HttpResponse.json(
        { message: 'Please check the session details and capacity' },
        { status: 400 },
      )
    }

    // Update the shared array
    sessions[index] = {
      ...sessions[index],
      ...updates,
      id,
    }

    return HttpResponse.json(sessions[index])
  }),

  // CREATE a new session
  http.post('/api/sessions', async ({ request }) => {
    let data: Omit<Session, 'id'>

    try {
      data = (await request.json()) as Omit<Session, 'id'>
    } catch {
      return HttpResponse.json(
        { message: 'Invalid request body' },
        { status: 400 },
      )
    }

    if (
      typeof data.title !== 'string' ||
      typeof data.date !== 'string' ||
      typeof data.location !== 'string' ||
      typeof data.capacity !== 'number' ||
      typeof data.registered !== 'number' ||
      !data.title.trim() ||
      !data.location.trim() ||
      !Number.isFinite(data.capacity) ||
      !Number.isFinite(data.registered) ||
      data.capacity < 1 ||
      data.registered < 0 ||
      data.registered > data.capacity
    ) {
      return HttpResponse.json(
        { message: 'Invalid session data' },
        { status: 400 },
      )
    }

    const newSession: Session = {
      ...data,
      id: Math.max(0, ...sessions.map((s) => s.id)) + 1,
    }

    sessions.push(newSession)

    return HttpResponse.json(newSession, { status: 201 })
  }),
]