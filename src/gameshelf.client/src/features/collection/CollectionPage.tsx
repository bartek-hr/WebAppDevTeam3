import { useState } from 'react'
import { Alert, Badge, Button, Col, Form, Table } from 'react-bootstrap'
import { PencilSquare, PlusLg, Star, StarFill, Trash } from 'react-bootstrap-icons'
import { Link, useSearchParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import IconButton from '../../components/IconButton'
import PageSpinner from '../../components/PageSpinner'
import type { CollectionRecord } from '../../types'
import { formatEdition } from '../../utils/format'
import AddCollectionModal from './AddCollectionModal'
import { useMyCollection, useUpdateCollectionRecord } from './api'
import {
  isRecordStatus,
  MAX_IN_PROGRESS,
  MAX_RATING,
  STATUS_LABELS,
  STATUS_VARIANTS,
  STATUSES,
} from './collectionRules'
import EditCollectionModal from './EditCollectionModal'
import RemoveCollectionModal from './RemoveCollectionModal'

// Eigenaar: Joran (zie docs/TAAKVERDELING.md)
export default function CollectionPage() {
  const { data: records, isLoading, isError, error } = useMyCollection()
  const update = useUpdateCollectionRecord()
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<CollectionRecord | null>(null)
  const [removing, setRemoving] = useState<CollectionRecord | null>(null)
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
  const atLimit = inProgress >= MAX_IN_PROGRESS
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
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h1 className="mb-0">Mijn collectie</h1>
        <Button disabled={!records} onClick={() => setAdding(true)}>
          <PlusLg className="me-1" />
          Game toevoegen
        </Button>
      </div>

      {records && (
        <p className={atLimit ? 'text-warning-emphasis' : 'text-body-secondary'}>
          <strong>
            {inProgress} van {MAX_IN_PROGRESS} campagnes bezig
          </strong>
          {atLimit && ', maak eerst een campagne af'}
        </p>
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

      {update.isError && (
        <Alert variant="danger" dismissible onClose={() => update.reset()}>
          {getErrorMessage(update.error)}
        </Alert>
      )}
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
                  <th>
                    <span className="visually-hidden">Acties</span>
                  </th>
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
                    <td className="text-end text-nowrap">
                      {record.plays}×
                      <IconButton
                        className="ms-2"
                        variant="outline-success"
                        icon={<PlusLg />}
                        tooltip="+1 gespeeld"
                        label={`+1 gespeeld: ${record.game.title}`}
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
                      />
                    </td>
                    <td className="text-nowrap">
                      <Rating value={record.rating} />
                    </td>
                    <td className="small" style={{ minWidth: '14rem' }}>
                      {record.note ?? <span className="text-body-secondary">–</span>}
                    </td>
                    <td className="text-end text-nowrap">
                      <IconButton
                        className="me-1"
                        variant="outline-primary"
                        icon={<PencilSquare />}
                        tooltip="Bewerken"
                        label={`Bewerk ${record.game.title}`}
                        onClick={() => setEditing(record)}
                      />
                      <IconButton
                        variant="outline-danger"
                        icon={<Trash />}
                        tooltip="Verwijderen"
                        label={`Verwijder ${record.game.title}`}
                        onClick={() => setRemoving(record)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}

      {adding && (
        <AddCollectionModal
          excludeIds={(records ?? []).map((r) => r.game.id)}
          onClose={() => setAdding(false)}
        />
      )}
      {editing && (
        <EditCollectionModal
          record={editing}
          records={records ?? []}
          onClose={() => setEditing(null)}
        />
      )}
      {removing && <RemoveCollectionModal record={removing} onClose={() => setRemoving(null)} />}
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
