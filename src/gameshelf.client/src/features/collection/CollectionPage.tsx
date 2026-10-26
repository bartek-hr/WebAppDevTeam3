import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import Alert from '../../components/Alert'
import IconButton from '../../components/IconButton'
import { EditIcon, PlusIcon, StarFillIcon, StarIcon, TrashIcon } from '../../components/icons'
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
import './CollectionPage.css'

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
      <div className="page-header">
        <h1>Mijn collectie</h1>
        <button
          type="button"
          className="btn btn--primary"
          disabled={!records}
          onClick={() => setAdding(true)}
        >
          <PlusIcon />
          Game toevoegen
        </button>
      </div>

      {records && (
        <p className={atLimit ? 'text-warning' : 'text-muted'}>
          <strong>
            {inProgress} van {MAX_IN_PROGRESS} campagnes bezig
          </strong>
          {atLimit && ', maak eerst een campagne af'}
        </p>
      )}

      <form role="search" className="filter-bar" onSubmit={(event) => event.preventDefault()}>
        <input
          type="search"
          className="input filter-bar__search"
          placeholder="Zoek op titel"
          aria-label="Zoek op titel"
          value={query}
          onChange={(event) => setFilter('q', event.target.value)}
        />
        <select
          className="input"
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
        </select>
      </form>

      {update.isError && (
        <Alert variant="danger" onClose={() => update.reset()}>
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
        <Alert variant="neutral">Je collectie is nog leeg.</Alert>
      )}
      {records && records.length > 0 && (
        <>
          <p className="text-small text-muted">
            {filtered.length} van {records.length} games
          </p>
          {filtered.length === 0 ? (
            <Alert variant="neutral">
              Geen games gevonden met deze filters.{' '}
              <button
                type="button"
                className="btn btn--link"
                onClick={() => setSearchParams({}, { replace: true })}
              >
                Filters wissen
              </button>
            </Alert>
          ) : (
            <div className="table-scroll">
              <table className="table table--hover">
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
                      <td className="collection-page__game">
                        <Link to={`/catalogue/${record.game.id}`}>{record.game.title}</Link>
                        <div className="text-small text-muted">{formatEdition(record.game)}</div>
                      </td>
                      <td>
                        <span className={`badge badge--${STATUS_VARIANTS[record.status]}`}>
                          {STATUS_LABELS[record.status]}
                        </span>
                      </td>
                      <td className="text-end nowrap">
                        <span className="collection-page__plays">
                          {record.plays}×
                          <IconButton
                            variant="outline-success"
                            icon={<PlusIcon />}
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
                        </span>
                      </td>
                      <td className="nowrap">
                        <Rating value={record.rating} />
                      </td>
                      <td className="collection-page__note text-small">
                        {record.note ?? <span className="text-muted">–</span>}
                      </td>
                      <td className="text-end nowrap">
                        <span className="collection-page__actions">
                          <IconButton
                            variant="outline-primary"
                            icon={<EditIcon />}
                            tooltip="Bewerken"
                            label={`Bewerk ${record.game.title}`}
                            onClick={() => setEditing(record)}
                          />
                          <IconButton
                            variant="outline-danger"
                            icon={<TrashIcon />}
                            tooltip="Verwijderen"
                            label={`Verwijder ${record.game.title}`}
                            onClick={() => setRemoving(record)}
                          />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
  if (value === undefined) return <span className="text-muted">–</span>
  return (
    <span className="collection-page__rating" title={`${value} van ${MAX_RATING} sterren`}>
      {Array.from({ length: MAX_RATING }, (_, i) =>
        i < value ? <StarFillIcon key={i} /> : <StarIcon key={i} />,
      )}
      <span className="visually-hidden">
        {value} van {MAX_RATING} sterren
      </span>
    </span>
  )
}
