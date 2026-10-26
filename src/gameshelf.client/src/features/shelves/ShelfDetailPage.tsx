import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import Alert from '../../components/Alert'
import GameCard from '../../components/GameCard'
import IconButton from '../../components/IconButton'
import PageSpinner from '../../components/PageSpinner'
import { ArrowLeftIcon, PlusIcon, XIcon } from '../../components/icons'
import { formatEdition } from '../../utils/format'
import { useMembers } from '../auth/api'
import { useAuth } from '../auth/useAuth'
import { useMyCollection } from '../collection/api'
import { useAddShelfRecord, useRemoveShelfRecord, useShelf } from './api'
import ShelfVisibility from './ShelfVisibility'
import './ShelfDetailPage.css'

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
        className="shelf-detail-page__back"
      >
        <ArrowLeftIcon />
        {owned ? 'Mijn planken' : (owner?.userName ?? 'Terug')}
      </Link>
      <div className="cluster shelf-detail-page__header">
        <h1>{shelf.name}</h1>
        <ShelfVisibility isPublic={shelf.isPublic} />
      </div>
      <p className="text-muted shelf-detail-page__description">
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
        <form
          className="cluster shelf-detail-page__add"
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
          <select
            className="input shelf-detail-page__select"
            aria-label="Game uit mijn collectie"
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            disabled={busy}
          >
            <option value="">Game uit je collectie…</option>
            {available.map((r) => (
              <option key={r.id} value={r.id}>
                {r.game.title} ({formatEdition(r.game)})
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="btn btn--primary"
            aria-label="Toevoegen aan plank"
            disabled={!recordId || busy}
          >
            <PlusIcon />
            Toevoegen
          </button>
        </form>
      )}
      {add.isError && <Alert variant="danger">{getErrorMessage(add.error)}</Alert>}
      {remove.isError && <Alert variant="danger">{getErrorMessage(remove.error)}</Alert>}

      {shelf.records.length === 0 && <Alert variant="neutral">Deze plank is nog leeg.</Alert>}
      <div className="card-grid">
        {shelf.records.map((r) => (
          <GameCard key={r.id} game={r.game} to={`/catalogue/${r.game.id}`}>
            {owned && (
              <IconButton
                variant="outline-danger"
                icon={<XIcon />}
                tooltip="Van plank halen"
                label={`Haal ${r.game.title} van plank`}
                disabled={busy}
                onClick={() => remove.mutate({ shelfId: shelf.id, recordId: r.id })}
              />
            )}
          </GameCard>
        ))}
      </div>
    </>
  )
}
