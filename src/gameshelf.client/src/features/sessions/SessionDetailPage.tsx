import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './css/SessionDetailPage.css'

type Session = {
  id: number
  title: string
  date: string
  location: string
  capacity: number
  registered: number
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError('Session ID is missing')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setSession(null)

    fetch(`/api/sessions/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Session not found')
        }

        return response.json()
      })
      .then((data: Session) => {
        setSession(data)
      })
      .catch((error: Error) => {
        setError(error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return <p>Loading session...</p>
  }

  if (error || !session) {
    return (
      <main>
        <h1>Session not found</h1>
        <p>{error ?? 'This session does not exist.'}</p>

        <button onClick={() => navigate('/sessions')}>
          Back to sessions
        </button>
      </main>
    )
  }

  return (
    <main>
      <button onClick={() => navigate('/sessions')}>
        &larr; Back to sessions
      </button>

      <h1>{session.title}</h1>

      <dl>
        <dt>Date</dt>
        <dd>{session.date}</dd>

        <dt>Location</dt>
        <dd>{session.location}</dd>

        <dt>Capacity</dt>
        <dd>{session.capacity}</dd>

        <dt>Registered</dt>
        <dd>{session.registered}</dd>

        <dt>Available places</dt>
        <dd>{session.capacity - session.registered}</dd>
      </dl>

      <button
        onClick={() => navigate(`/sessions/${session.id}/edit`)}
      >
        Edit session
      </button>
    </main>
  )
}