import { Alert, Col, Row } from 'react-bootstrap'
import { Gift, PencilSquare } from 'react-bootstrap-icons'
import { Link, useParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import PageSpinner from '../../components/PageSpinner'
import { useMember } from '../auth/api'
import { useAuth } from '../auth/useAuth'
import { useMemberShelves } from '../shelves/api'
import ShelfCard from '../shelves/ShelfCard'

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
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h1 className="mb-0">{member.userName}</h1>
        <div className="d-flex gap-2">
          {owned && (
            <Link to="/shelves" className="btn btn-outline-primary">
              <PencilSquare className="me-1" />
              Planken beheren
            </Link>
          )}
          <Link
            to={`/wishlists?member=${encodeURIComponent(member.id)}`}
            className="btn btn-outline-secondary"
            aria-label={`Verlanglijst van ${member.userName}`}
          >
            <Gift className="me-1" />
            Verlanglijst
          </Link>
        </div>
      </div>
      <h2 className="h5 text-body-secondary">Planken</h2>
      {shelvesQuery.data.length === 0 && (
        <Alert variant="light" className="border">
          {owned ? 'Nog geen planken.' : 'Nog geen openbare planken.'}
        </Alert>
      )}
      <Row xs={1} md={2} lg={3} className="g-3">
        {shelvesQuery.data.map((shelf) => (
          <Col key={shelf.id}>
            <ShelfCard shelf={shelf} />
          </Col>
        ))}
      </Row>
    </>
  )
}
