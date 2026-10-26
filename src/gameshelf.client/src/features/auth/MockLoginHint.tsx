import Alert from '../../components/Alert'
import { useMembers } from './api'
import { useAuth } from './useAuth'
import './MockLoginHint.css'

// Alleen in mockmodus: met één klik inloggen als een van de mockleden
export default function MockLoginHint() {
  const { login } = useAuth()
  const { data: members = [] } = useMembers()

  return (
    <Alert variant="info" className="mock-login-hint">
      <strong>Mockmodus:</strong> log in met een mocklid, elk wachtwoord werkt. Snel inloggen als:{' '}
      {members.map((member) => (
        <button
          key={member.id}
          type="button"
          className="btn btn--link mock-login-hint__member"
          onClick={() => login({ userNameOrEmail: member.userName, password: 'mock' })}
        >
          {member.userName}
          {member.isCommittee && ' (bestuur)'}
        </button>
      ))}
    </Alert>
  )
}
