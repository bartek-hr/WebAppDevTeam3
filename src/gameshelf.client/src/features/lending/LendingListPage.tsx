import { Alert, Col, Row } from 'react-bootstrap'
import { Person } from 'react-bootstrap-icons'
import { getErrorMessage } from '../../api/errors'
import GameCard from '../../components/GameCard'
import PageSpinner from '../../components/PageSpinner'
import { useMembers } from '../auth/api'
import { useBoxes } from './api'
import { BoxAvailabilityBadge } from './StatusBadges'

// Eigenaar: Rayell (zie docs/TAAKVERDELING.md)
export default function LendingListPage() {
  const { data: boxes, isLoading, isError, error } = useBoxes()
  const { data: members } = useMembers()

  const userNames = new Map(members?.map((member) => [member.id, member.userName]))
  const sorted = [...(boxes ?? [])].sort(
    (a, b) => a.game.title.localeCompare(b.game.title, 'nl') || a.id - b.id,
  )

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
        <h1 className="mb-0">Uitleenlijst</h1>
      </div>
      <p className="text-body-secondary">
        Dozen die leden aan elkaar willen uitlenen. Deze lijst staat los van je collectie: je kiest
        zelf welke dozen je hier aanbiedt.
      </p>

      {isLoading && <PageSpinner />}
      {isError && (
        <Alert variant="danger">
          De uitleenlijst kon niet geladen worden. {getErrorMessage(error)}
        </Alert>
      )}
      {boxes && (
        <Row xs={1} sm={2} md={3} lg={4} className="g-3">
          {sorted.map((box) => (
            <Col key={box.id}>
              <GameCard game={box.game} to={`/catalogue/${box.game.id}`}>
                <div className="small mb-1">
                  <Person className="me-1" />
                  Eigenaar: {userNames.get(box.ownerId) ?? '…'}
                </div>
                <p className="small text-body-secondary mb-2">{box.condition}</p>
                <BoxAvailabilityBadge isOnLoan={box.isOnLoan} />
              </GameCard>
            </Col>
          ))}
        </Row>
      )}
    </>
  )
}
