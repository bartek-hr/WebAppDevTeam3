import { useState } from 'react'
import { Alert, Button, Col, Form, Row } from 'react-bootstrap'
import { Person, PlusLg } from 'react-bootstrap-icons'
import { useSearchParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import GameCard from '../../components/GameCard'
import PageSpinner from '../../components/PageSpinner'
import { useMembers } from '../auth/api'
import { useBoxes } from './api'
import BoxFormModal from './BoxFormModal'
import { BoxAvailabilityBadge } from './StatusBadges'

// Eigenaar: Rayell (zie docs/TAAKVERDELING.md)
export default function LendingListPage() {
  const { data: boxes, isLoading, isError, error } = useBoxes()
  const { data: members } = useMembers()
  const [isOffering, setIsOffering] = useState(false)
  // Filters staan in de URL, net als in de catalogus
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const onlyAvailable = searchParams.get('available') === '1'

  function setFilter(key: string, value: string) {
    setSearchParams(
      (params) => {
        if (value) params.set(key, value)
        else params.delete(key)
        return params
      },
      { replace: true },
    )
  }

  const userNames = new Map(members?.map((member) => [member.id, member.userName]))
  const search = query.trim().toLowerCase()
  const filtered = (boxes ?? [])
    .filter((box) => !search || box.game.title.toLowerCase().includes(search))
    .filter((box) => !onlyAvailable || !box.isOnLoan)
    .sort((a, b) => a.game.title.localeCompare(b.game.title, 'nl') || a.id - b.id)

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
        <h1 className="mb-0">Uitleenlijst</h1>
        <Button onClick={() => setIsOffering(true)}>
          <PlusLg className="me-1" />
          Doos aanbieden
        </Button>
      </div>
      <p className="text-body-secondary">
        Dozen die leden aan elkaar willen uitlenen. Deze lijst staat los van je collectie: je kiest
        zelf welke dozen je hier aanbiedt.
      </p>

      <Form role="search" className="row g-2 mb-3" onSubmit={(event) => event.preventDefault()}>
        <Col md={6}>
          <Form.Control
            type="search"
            placeholder="Zoek op titel"
            aria-label="Zoek op titel"
            value={query}
            onChange={(event) => setFilter('q', event.target.value)}
          />
        </Col>
        <Col md={6} className="d-flex align-items-center">
          <Form.Check
            type="switch"
            id="only-available"
            label="Alleen beschikbaar"
            checked={onlyAvailable}
            onChange={(event) => setFilter('available', event.target.checked ? '1' : '')}
          />
        </Col>
      </Form>

      {isLoading && <PageSpinner />}
      {isError && (
        <Alert variant="danger">
          De uitleenlijst kon niet geladen worden. {getErrorMessage(error)}
        </Alert>
      )}
      {boxes && (
        <>
          <p className="small text-body-secondary">
            {filtered.length} van {boxes.length} dozen
          </p>
          {filtered.length === 0 ? (
            <Alert variant="light" className="border">
              Geen dozen gevonden met deze filters.{' '}
              <Button
                variant="link"
                className="p-0 align-baseline"
                onClick={() => setSearchParams({}, { replace: true })}
              >
                Filters wissen
              </Button>
            </Alert>
          ) : (
            <Row xs={1} sm={2} md={3} lg={4} className="g-3">
              {filtered.map((box) => (
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
      )}

      {isOffering && <BoxFormModal onClose={() => setIsOffering(false)} />}
    </>
  )
}
