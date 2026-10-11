import { useState } from 'react'
import type { CollectionRecord } from '../../types'
import EditCollectionModal from './EditCollectionModal'
import AddCollectionModal from './AddCollectionModal'
import RemoveCollectionModal from './RemoveCollectionModal'
import { Alert, Badge, Button, Col, Form, Table } from 'react-bootstrap'
import { Star, StarFill } from 'react-bootstrap-icons'
import { Link, useSearchParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import PageSpinner from '../../components/PageSpinner'
import { formatEdition } from '../../utils/format'
import { useMyCollection, useUpdateCollectionRecord } from './api'
import {
  isRecordStatus,
  MAX_IN_PROGRESS,
  MAX_RATING,
  STATUS_LABELS,
  STATUS_VARIANTS,
  STATUSES,
} from './collectionRules'

// Eigenaar: Joran (zie docs/TAAKVERDELING.md)
export default function CollectionPage() {
  const update = useUpdateCollectionRecord()
  const [editing, setEditing] = useState<CollectionRecord | null>(null)
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<CollectionRecord | null>(null)
  const { data: records, isLoading, isError, error } = useMyCollection()
  // Filters staan in de URL, net als in de catalogus
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const statusParam = searchParams.get('status') ?? ''
  const status = isRecordStatus(statusParam) ? statusParam : ''

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

  const inProgress = (records ?? []).filter((r) => r.status === 'InProgress').length
  const search = query.trim().toLowerCase()
  const filtered = (records ?? [])
    .filter((r) => !search || r.game.title.toLowerCase().includes(search))
    .filter((r) => !status || r.status === status)
    .sort(
      (a, b) =>
        a.game.title.localeCompare(b.game.title, 'nl') || a.game.releaseYear - b.game.releaseYear,
    )

  return (
    <>
      <h1>Mijn collectie</h1>
      {update.isError && <Alert variant="danger">{getErrorMessage(update.error)}</Alert>}
      {editing && (
        <EditCollectionModal
          record={editing}
          records={records ?? []}
          onClose={() => setEditing(null)}
        />
      )}
      <Button className="mb-3" disabled={!records} onClick={() => setAdding(true)}>
        Game toevoegen
      </Button>
      {adding && (
        <AddCollectionModal
          excludeIds={(records ?? []).map((r) => r.game.id)}
          onClose={() => setAdding(false)}
        />
      )}
      {removing && <RemoveCollectionModal record={removing} onClose={() => setRemoving(null)} />}
      <p className="text-body-secondary">
        Elke game die je bezit, met wat de doos niet vertelt: hoe vaak je hem speelde, wat je ervan
        vindt en wat er mist.
      </p>

      {records && (
        <Alert variant={inProgress >= MAX_IN_PROGRESS ? 'warning' : 'light'} className="border">
          <strong>
            {inProgress} van {MAX_IN_PROGRESS} campagnes bezig
          </strong>
          {inProgress >= MAX_IN_PROGRESS &&
            '. Maak eerst een campagne af voor je een nieuwe begint.'}
        </Alert>
      )}

      <Form role="search" className="row g-2 mb-3" onSubmit={(event) => event.preventDefault()}>
        <Col md={8}>
          <Form.Control
            type="search"
            placeholder="Zoek op titel"
            aria-label="Zoek op titel"
            value={query}
            onChange={(event) => setFilter('q', event.target.value)}
          />
        </Col>
        <Col md={4}>
          <Form.Select
            aria-label="Status"
            value={status}
            onChange={(event) => setFilter('status', event.target.value)}
          >
            <option value="">Alle statussen</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Form>

      {isLoading && <PageSpinner />}
      {isError && (
        <Alert variant="danger">
          Je collectie kon niet geladen worden. {getErrorMessage(error)}
        </Alert>
      )}
      {records && records.length === 0 && (
        <Alert variant="light" className="border">
          Je collectie is nog leeg.
        </Alert>
      )}
      {records && records.length > 0 && (
        <>
          <p className="small text-body-secondary">
            {filtered.length} van {records.length} games
          </p>
          {filtered.length === 0 ? (
            <Alert variant="light" className="border">
              Geen games gevonden met deze filters.{' '}
              <Button
                variant="link"
                className="p-0 align-baseline"
                onClick={() => setSearchParams({}, { replace: true })}
              >
                Filters wissen
              </Button>
            </Alert>
          ) : (
            <Table responsive hover className="align-middle">
              <thead>
                <tr>
                  <th>Game</th>
                  <th>Status</th>
                  <th className="text-end">Gespeeld</th>
                  <th>Beoordeling</th>
                  <th>Notitie</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => (
                  <tr key={record.id}>
                    <td style={{ minWidth: '12rem' }}>
                      <Link to={`/catalogue/${record.game.id}`}>{record.game.title}</Link>
                      <div className="small text-body-secondary">{formatEdition(record.game)}</div>
                    </td>
                    <td>
                      <Badge bg={STATUS_VARIANTS[record.status]}>
                        {STATUS_LABELS[record.status]}
                      </Badge>
                    </td>
                    <td className="text-end">{record.plays}×</td>
                    <td className="text-nowrap">
                      <Rating value={record.rating} />
                    </td>
                    <td className="small" style={{ minWidth: '14rem' }}>
                      {record.note ?? <span className="text-body-secondary">–</span>}
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-2" style={{ minWidth: '12rem' }}>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          aria-label={`Bewerk ${record.game.title}`}
                          disabled={update.isPending}
                          onClick={() => setEditing(record)}
                        >
                          Bewerken
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-success"
                          aria-label={`+1 gespeeld: ${record.game.title}`}
                          disabled={update.isPending}
                          onClick={() =>
                            update.mutate({
                              id: record.id,
                              status: record.status,
                              plays: record.plays + 1,
                              rating: record.rating,
                              note: record.note,
                            })
                          }
                        >
                          +1 gespeeld
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          aria-label={`Verwijder ${record.game.title}`}
                          onClick={() => setRemoving(record)}
                        >
                          Verwijderen
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </>
  )
}

function Rating({ value }: { value?: number }) {
  if (value === undefined) return <span className="text-body-secondary">–</span>
  return (
    <span className="text-warning" title={`${value} van ${MAX_RATING} sterren`}>
      {Array.from({ length: MAX_RATING }, (_, i) =>
        i < value ? <StarFill key={i} aria-hidden /> : <Star key={i} aria-hidden />,
      )}
      <span className="visually-hidden">
        {value} van {MAX_RATING} sterren
      </span>
    </span>
  )
}
