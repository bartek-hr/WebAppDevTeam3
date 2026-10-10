import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './css/SessionPage.css'

type Session = {
  id: number
  title: string
  date: string
  location: string
  capacity: number
  registered: number
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/sessions')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch sessions')
        }

        return response.json()
      })
      .then((data: Session[]) => {
        setSessions(data)
      })
      .catch((error: Error) => {
        setError(error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <p>Loading sessions...</p>
  }

  if (error) {
    return <p>Error: {error}</p>
  }

  return (
    <main>
      <h1>Sessions</h1>

      <button onClick={() => navigate('/sessions/new')}>
        Create session
      </button>

      {sessions.length === 0 ? (
        <p>No sessions found.</p>
      ) : (
        <table className="sessions-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Location</th>
              <th>Capaciteit</th>
              <th>Aangemeld</th>
              <th>Details</th>
            </tr>
          </thead>

          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                <td>{session.title}</td>
                <td>{session.date}</td>
                <td>{session.location}</td>
                <td>{session.capacity}</td>
                <td>{session.registered}</td>
                <td>
                  <button
                    onClick={() =>
                      navigate(`/sessions/${session.id}`)
                    }
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}