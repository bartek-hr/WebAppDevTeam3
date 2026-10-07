import { Alert, Button } from 'react-bootstrap'
import { useMembers } from './api'
import { useAuth } from './useAuth'

// Alleen in mockmodus: met één klik inloggen als een van de mockleden
export default function MockLoginHint() {
  const { login } = useAuth()
  const { data: members = [] } = useMembers()

  return (
    <Alert variant="info" className="small mt-3 mb-0">
      <strong>Mockmodus:</strong> log in met een mocklid, elk wachtwoord werkt. Snel inloggen als:{' '}
      {members.map((member) => (
        <Button
          key={member.id}
          variant="link"
          size="sm"
          className="p-0 me-2 align-baseline"
          onClick={() => login({ userNameOrEmail: member.userName, password: 'mock' })}
        >
          {member.userName}
          {member.isCommittee && ' (bestuur)'}
        </Button>
      ))}
    </Alert>
  )
}
