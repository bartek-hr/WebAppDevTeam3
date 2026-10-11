import { useState } from 'react'
import { Alert, Button, Col, Form, Row } from 'react-bootstrap'
import { ArrowLeft, PlusLg, XLg } from 'react-bootstrap-icons'
import { Link, useParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import GameCard from '../../components/GameCard'
import IconButton from '../../components/IconButton'
import PageSpinner from '../../components/PageSpinner'
import { formatEdition } from '../../utils/format'
import { useMembers } from '../auth/api'
import { useAuth } from '../auth/useAuth'
import { useMyCollection } from '../collection/api'
import { useAddShelfRecord, useRemoveShelfRecord, useShelf } from './api'
import ShelfVisibility from './ShelfVisibility'

// Eigenaar: Joran (zie docs/TAAKVERDELING.md)
export default function ShelfDetailPage() {
  const { id } = useParams()
  const query = useShelf(Number(id))
  const { member } = useAuth()
  const owned = !!query.data && query.data.ownerId === member?.id
  const collection = useMyCollection(owned)
  const { data: members } = useMembers()
  const add = useAddShelfRecord()
  const remove = useRemoveShelfRecord()
  const [recordId, setRecordId] = useState('')
  const busy = add.isPending || remove.isPending

  if (query.isLoading) return <PageSpinner />
  if (!query.data)
    return (
      <Alert variant="danger">
        {getErrorMessage(query.error)} <Link to="/shelves">Terug naar mijn planken</Link>
      </Alert>
    )
  const shelf = query.data
  const owner = members?.find((m) => m.id === shelf.ownerId)
  const available = collection.data?.filter((r) => !shelf.recordIds.includes(r.id)) ?? []

  return (
    <>
      <Link
        to={owned ? '/shelves' : `/members/${shelf.ownerId}`}
        className="small text-decoration-none"
      >
        <ArrowLeft className="me-1" />
        {owned ? 'Mijn planken' : (owner?.userName ?? 'Terug')}
      </Link>
      <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
        <h1 className="mb-0">{shelf.name}</h1>
        <ShelfVisibility isPublic={shelf.isPublic} />
      </div>
      <p className="text-body-secondary mt-1">
        {shelf.description}
        {!owned && owner && (
          <>
            {shelf.description && ' · '}
            van <Link to={`/members/${shelf.ownerId}`}>{owner.userName}</Link>
          </>
        )}
      </p>

      {owned && collection.isError && (
        <Alert variant="danger">{getErrorMessage(collection.error)}</Alert>
      )}
      {owned && available.length > 0 && (
        <Form
          className="d-flex flex-wrap gap-2 mb-3"
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
          <Form.Select
            aria-label="Game uit mijn collectie"
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            disabled={busy}
            style={{ flex: '1 1 16rem', maxWidth: '32rem' }}
          >
            <option value="">Game uit je collectie…</option>
            {available.map((r) => (
              <option key={r.id} value={r.id}>
                {r.game.title} ({formatEdition(r.game)})
              </option>
            ))}
          </Form.Select>
          <Button type="submit" aria-label="Toevoegen aan plank" disabled={!recordId || busy}>
            <PlusLg className="me-1" />
            Toevoegen
          </Button>
        </Form>
      )}
      {add.isError && <Alert variant="danger">{getErrorMessage(add.error)}</Alert>}
      {remove.isError && <Alert variant="danger">{getErrorMessage(remove.error)}</Alert>}

      {shelf.records.length === 0 && (
        <Alert variant="light" className="border">
          Deze plank is nog leeg.
        </Alert>
      )}
      <Row xs={1} sm={2} md={3} lg={4} className="g-3">
        {shelf.records.map((r) => (
          <Col key={r.id}>
            <GameCard game={r.game} to={`/catalogue/${r.game.id}`}>
              {owned && (
                <IconButton
                  variant="outline-danger"
                  icon={<XLg />}
                  tooltip="Van plank halen"
                  label={`Haal ${r.game.title} van plank`}
                  disabled={busy}
                  onClick={() => remove.mutate({ shelfId: shelf.id, recordId: r.id })}
                />
              )}
            </GameCard>
          </Col>
        ))}
      </Row>
    </>
  )
}
