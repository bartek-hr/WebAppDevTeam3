import { Alert, Badge, Card, Col, Row } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import PageSpinner from '../../components/PageSpinner'
import { useMember, useMembers } from '../auth/api'
import { useAuth } from '../auth/useAuth'
import { useMemberShelves } from '../shelves/api'

export default function MemberProfilePage() {
  const { id = '' } = useParams()
  const memberQuery = useMember(id)
  const shelvesQuery = useMemberShelves(id)
  const membersQuery = useMembers()
  const { member: currentMember } = useAuth()
  if (memberQuery.isLoading || shelvesQuery.isLoading) return <PageSpinner />
  if (memberQuery.isError || shelvesQuery.isError)
    return (
      <Alert variant="danger">{getErrorMessage(memberQuery.error ?? shelvesQuery.error)}</Alert>
    )
  if (!memberQuery.data || !shelvesQuery.data) return null
  const member = memberQuery.data
  const owned = member.id === currentMember?.id
  return (
    <>
      <h1>{member.userName}</h1>
      <p>
        <Link to={`/wishlists?member=${encodeURIComponent(member.id)}`}>
          Verlanglijst van {member.userName}
        </Link>
      </p>
      <h2 className="h4">{owned ? 'Mijn planken' : 'Openbare planken'}</h2>
      {owned && (
        <p className="text-body-secondary">
          Je ziet hier ook je privé-planken. <Link to="/shelves">Planken beheren</Link>
        </p>
      )}
      {shelvesQuery.data.length === 0 && (
        <Alert variant="light" className="border">
          {owned ? 'Je hebt nog geen planken.' : 'Dit lid heeft nog geen openbare planken.'}
        </Alert>
      )}
      <Row className="g-3">
        {shelvesQuery.data.map((shelf) => (
          <Col key={shelf.id} md={6} lg={4}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title as="h3" className="h5">
                  <Link to={`/shelves/${shelf.id}`}>{shelf.name}</Link>
                </Card.Title>
                <Badge bg={shelf.isPublic ? 'success' : 'secondary'}>
                  {shelf.isPublic ? 'Openbaar' : 'Privé'}
                </Badge>
                <p className="mt-2">{shelf.description}</p>
                <p>{shelf.recordIds.length} games</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <h2 className="h4 mt-4">Andere leden</h2>
      {membersQuery.isError && (
        <Alert variant="danger">{getErrorMessage(membersQuery.error)}</Alert>
      )}
      <div className="d-flex flex-wrap gap-3">
        {membersQuery.data
          ?.filter((m) => m.id !== member.id)
          .map((m) => (
            <Link key={m.id} to={`/members/${m.id}`}>
              {m.userName}
            </Link>
          ))}
      </div>
    </>
  )
}
