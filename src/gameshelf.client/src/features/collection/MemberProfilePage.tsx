import { Link, useParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import Alert from '../../components/Alert'
import { EditIcon, GiftIcon } from '../../components/icons'
import PageSpinner from '../../components/PageSpinner'
import { useMember } from '../auth/api'
import { useAuth } from '../auth/useAuth'
import { useMemberShelves } from '../shelves/api'
import ShelfCard from '../shelves/ShelfCard'
import './MemberProfilePage.css'

// Eigenaar: Joran (zie docs/TAAKVERDELING.md)
export default function MemberProfilePage() {
  const { id = '' } = useParams()
  const memberQuery = useMember(id)
  const shelvesQuery = useMemberShelves(id)
  const { member: currentMember } = useAuth()
  if (memberQuery.isLoading || shelvesQuery.isLoading) return <PageSpinner />
  if (!memberQuery.data || !shelvesQuery.data)
    return (
      <Alert variant="danger">{getErrorMessage(memberQuery.error ?? shelvesQuery.error)}</Alert>
    )
  const member = memberQuery.data
  const owned = member.id === currentMember?.id
  return (
    <>
      <div className="page-header">
        <h1>{member.userName}</h1>
        <div className="cluster">
          {owned && (
            <Link to="/shelves" className="btn btn--outline-primary">
              <EditIcon />
              Planken beheren
            </Link>
          )}
          <Link
            to={`/wishlists?member=${encodeURIComponent(member.id)}`}
            className="btn btn--outline-secondary"
            aria-label={`Verlanglijst van ${member.userName}`}
          >
            <GiftIcon />
            Verlanglijst
          </Link>
        </div>
      </div>
      <h2 className="member-profile-page__subheading text-muted">Planken</h2>
      {shelvesQuery.data.length === 0 && (
        <Alert variant="neutral">
          {owned ? 'Nog geen planken.' : 'Nog geen openbare planken.'}
        </Alert>
      )}
      <div className="card-grid card-grid--wide">
        {shelvesQuery.data.map((shelf) => (
          <ShelfCard key={shelf.id} shelf={shelf} />
        ))}
      </div>
    </>
  )
}
