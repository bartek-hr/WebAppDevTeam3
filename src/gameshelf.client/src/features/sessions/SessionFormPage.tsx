import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Session } from './mocks'

export default function SessionFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [capacity, setCapacity] = useState(10)
  const [registered, setRegistered] = useState(0)

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    let cancelled = false

    fetch(`/api/sessions/${id}`)
      .then(async (response) => {
        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'Session not found')
        }

        return response.json() as Promise<Session>
      })
      .then((session) => {
        if (cancelled) return

        setTitle(session.title)
        setDate(session.date)
        setLocation(session.location)
        setCapacity(session.capacity)
        setRegistered(session.registered)
      })
      .catch((error: Error) => {
        if (!cancelled) setError(error.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSaving(true)

    const sessionData = {
      title: title.trim(),
      date,
      location: location.trim(),
      capacity,
      registered,
    }

    try {
      const response = await fetch(
        isEditing ? `/api/sessions/${id}` : '/api/sessions',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sessionData),
        },
      )

      if (!response.ok) {
        const message = await response.text()

        throw new Error(
          `Save failed (${response.status}): ${message}`,
        )
      }

      const savedSession: Session = await response.json()

      navigate(`/sessions/${savedSession.id}`)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Something went wrong while saving',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p>Loading session...</p>
  }

  if (isEditing && error && !title && !date && !location) {
    return (
      <main>
        <h1>Could not load session</h1>
        <p role="alert">{error}</p>
        <button onClick={() => navigate('/sessions')}>
          Back to sessions
        </button>
      </main>
    )
  }

  return (
    <main>
      <h1>{isEditing ? 'Edit session' : 'Create session'}</h1>

      {error && <p role="alert">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="capacity">Capacity</label>
          <input
            id="capacity"
            type="number"
            min="1"
            value={capacity}
            onChange={(event) => setCapacity(Number(event.target.value))}
            required
          />
        </div>

        <div>
          <label htmlFor="registered">Registered</label>
          <input
            id="registered"
            type="number"
            min="0"
            max={capacity}
            value={registered}
            onChange={(event) => setRegistered(Number(event.target.value))}
            required
          />
        </div>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={() =>
            navigate(isEditing ? `/sessions/${id}` : '/sessions')
          }
        >
          Cancel
        </button>
      </form>
    </main>
  )
}