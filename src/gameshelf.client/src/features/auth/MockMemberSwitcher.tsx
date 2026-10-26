import { useMembers } from './api'
import { useAuth } from './useAuth'

// Alleen in mockmodus: wissel van lid om "mijn" en "van een ander" (en het bestuur) te testen
export default function MockMemberSwitcher() {
  const { member, login } = useAuth()
  const { data: members = [] } = useMembers()

  return (
    <>
      <hr className="nav-menu__divider" />
      <div className="nav-menu__header">Wissel van lid (mock)</div>
      {members.map((m) => (
        <button
          key={m.id}
          type="button"
          className="nav-menu__item"
          aria-current={m.id === member?.id ? 'true' : undefined}
          onClick={() => login({ userNameOrEmail: m.userName, password: 'mock' })}
        >
          {m.userName}
          {m.isCommittee && ' (bestuur)'}
        </button>
      ))}
    </>
  )
}
