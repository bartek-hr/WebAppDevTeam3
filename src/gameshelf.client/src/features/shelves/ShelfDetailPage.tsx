import { useState } from 'react'
import { Alert, Badge, Button, Col, Form, Row } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import GameCard from '../../components/GameCard'
import PageSpinner from '../../components/PageSpinner'
import { useMember } from '../auth/api'
import { useAuth } from '../auth/useAuth'
import { useMyCollection } from '../collection/api'
import { formatEdition } from '../../utils/format'
import { useAddShelfRecord, useRemoveShelfRecord, useShelf } from './api'

export default function ShelfDetailPage() {
  const { id } = useParams()
  const query = useShelf(Number(id))
  const { member } = useAuth()
  const owned = !!query.data && query.data.ownerId === member?.id
  const collection = useMyCollection(owned)
  const add = useAddShelfRecord()
  const remove = useRemoveShelfRecord()
  const [recordId, setRecordId] = useState('')
  const available = collection.data?.filter((r) => !query.data?.recordIds.includes(r.id)) ?? []
  if (query.isLoading) return <PageSpinner />
  if (query.isError)
    return (
      <Alert variant="danger">
        {getErrorMessage(query.error)} <Link to="/shelves">Terug naar mijn planken</Link>
      </Alert>
    )
  if (!query.data) return null
  const shelf = query.data
  return (
    <>
      <Link to={owned ? '/shelves' : `/members/${shelf.ownerId}`}>
        {owned ? 'Mijn planken' : 'Profiel van de eigenaar'}
      </Link>
      <h1 className="mt-3">{shelf.name}</h1>
      <ShelfOwner memberId={shelf.ownerId} />
      <Badge bg={shelf.isPublic ? 'success' : 'secondary'}>
        {shelf.isPublic ? 'Openbaar' : 'Privé'}
      </Badge>
      <p className="mt-2">{shelf.description}</p>
      <p>{shelf.records.length} games</p>
      {owned && (
        <>
          {collection.isLoading && <PageSpinner />}
          {collection.isError && (
            <Alert variant="danger">{getErrorMessage(collection.error)}</Alert>
          )}
          {collection.data &&
            (available.length ? (
              <Form
                className="mb-3"
                onSubmit={async (event) => {
                  event.preventDefault()
                  try {
                    await add.mutateAsync({ shelfId: shelf.id, recordId: Number(recordId) })
                    setRecordId('')
                  } catch {
                    /* Fout hieronder */
                  }
                }}
              >
                <Form.Label htmlFor="shelf-record">Game uit mijn collectie</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  <Form.Select
                    id="shelf-record"
                    value={recordId}
                    onChange={(e) => setRecordId(e.target.value)}
                    disabled={add.isPending || remove.isPending}
                    style={{ flex: '1 1 16rem' }}
                  >
                    <option value="">Kies een game</option>
                    {available.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.game.title} ({formatEdition(r.game)})
                      </option>
                    ))}
                  </Form.Select>
                  <Button type="submit" disabled={!recordId || add.isPending || remove.isPending}>
                    Toevoegen aan plank
                  </Button>
                </div>
              </Form>
            ) : (
              <Alert variant="info">
                Alle games uit je collectie staan al op deze plank.{' '}
                <Link to="/collection">Beheer je collectie</Link>.
              </Alert>
            ))}
        </>
      )}
      {add.isError && <Alert variant="danger">{getErrorMessage(add.error)}</Alert>}
      {remove.isError && <Alert variant="danger">{getErrorMessage(remove.error)}</Alert>}
      {shelf.records.length === 0 && (
        <Alert variant="light" className="border">
          Deze plank is nog leeg.
        </Alert>
      )}
      <Row className="g-3">
        {shelf.records.map((r) => (
          <Col key={r.id} sm={6} lg={4}>
            <GameCard game={r.game} to={`/catalogue/${r.game.id}`}>
              {owned && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  aria-label={`Haal ${r.game.title} van plank`}
                  disabled={remove.isPending || add.isPending}
                  onClick={() => remove.mutate({ shelfId: shelf.id, recordId: r.id })}
                >
                  Van plank halen
                </Button>
              )}
            </GameCard>
          </Col>
        ))}
      </Row>
      {owned && (
        <p className="small text-body-secondary mt-3">
          Een game van de plank halen laat hem in je collectie en op je andere planken staan.
        </p>
      )}
    </>
  )
}

function ShelfOwner({ memberId }: { memberId: string }) {
  const owner = useMember(memberId)
  return owner.data ? (
    <p>
      Van <Link to={`/members/${memberId}`}>{owner.data.userName}</Link>
    </p>
  ) : null
}
