import { NavDropdown } from 'react-bootstrap'
import { useMembers } from './api'
import { useAuth } from './useAuth'

// Alleen in mockmodus: wissel van lid om "mijn" en "van een ander" (en het bestuur) te testen
export default function MockMemberSwitcher() {
  const { member, login } = useAuth()
  const { data: members = [] } = useMembers()

  return (
    <>
      <NavDropdown.Divider />
      <NavDropdown.Header>Wissel van lid (mock)</NavDropdown.Header>
      {members.map((m) => (
        <NavDropdown.Item
          key={m.id}
          as="button"
          active={m.id === member?.id}
          onClick={() => login({ userNameOrEmail: m.userName, password: 'mock' })}
        >
          {m.userName}
          {m.isCommittee && ' (bestuur)'}
        </NavDropdown.Item>
      ))}
    </>
  )
}
