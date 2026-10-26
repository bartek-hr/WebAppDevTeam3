import { useState } from 'react'
import Alert from '../../components/Alert'
import { PersonIcon, PlusIcon } from '../../components/icons'
import './lending.css'
import { useSearchParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import GameCard from '../../components/GameCard'
import PageSpinner from '../../components/PageSpinner'
import { useMembers } from '../auth/api'
import { useAuth } from '../auth/useAuth'
import { useBoxes, useLoanRequests } from './api'
import BoxCardActions from './BoxCardActions'
import BoxFormModal from './BoxFormModal'
import RequestBoxButton from './RequestBoxButton'
import { BoxAvailabilityBadge } from './StatusBadges'

// Eigenaar: Rayell (zie docs/TAAKVERDELING.md)
export default function LendingListPage() {
  const { data: boxes, isLoading, isError, error } = useBoxes()
  const { data: members } = useMembers()
  const { data: loanRequests } = useLoanRequests()
  const { member } = useAuth()
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
  const requestedBoxIds = new Set(
    loanRequests
      ?.filter((r) => r.requesterId === member?.id && r.status === 'Pending')
      .map((r) => r.boxId),
  )
  const search = query.trim().toLowerCase()
  const filtered = (boxes ?? [])
    .filter((box) => !search || box.game.title.toLowerCase().includes(search))
    .filter((box) => !onlyAvailable || !box.isOnLoan)
    .sort((a, b) => a.game.title.localeCompare(b.game.title, 'nl') || a.id - b.id)

  return (
    <>
      <div className="page-header">
        <h1>Uitleenlijst</h1>
        <button type="button" className="btn btn--primary" onClick={() => setIsOffering(true)}>
          <PlusIcon />
          Doos aanbieden
        </button>
      </div>
      <p className="text-muted">
        Dozen die leden aan elkaar willen uitlenen. Deze lijst staat los van je collectie: je kiest
        zelf welke dozen je hier aanbiedt.
      </p>

      <form
        role="search"
        className="filter-bar lending-filter"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="filter-bar__search">
          <input
            className="input"
            type="search"
            placeholder="Zoek op titel"
            aria-label="Zoek op titel"
            value={query}
            onChange={(event) => setFilter('q', event.target.value)}
          />
        </div>
        <div className="switch">
          <input
            type="checkbox"
            role="switch"
            className="switch__input"
            id="only-available"
            checked={onlyAvailable}
            onChange={(event) => setFilter('available', event.target.checked ? '1' : '')}
          />
          <label className="switch__label" htmlFor="only-available">
            Alleen beschikbaar
          </label>
        </div>
      </form>

      {isLoading && <PageSpinner />}
      {isError && (
        <Alert variant="danger">
          De uitleenlijst kon niet geladen worden. {getErrorMessage(error)}
        </Alert>
      )}
      {boxes && (
        <>
          <p className="text-small text-muted">
            {filtered.length} van {boxes.length} dozen
          </p>
          {filtered.length === 0 ? (
            <Alert variant="neutral">
              Geen dozen gevonden met deze filters.{' '}
              <button
                type="button"
                className="btn btn--link lending-clear"
                onClick={() => setSearchParams({}, { replace: true })}
              >
                Filters wissen
              </button>
            </Alert>
          ) : (
            <div className="card-grid">
              {filtered.map((box) => (
                <div key={box.id}>
                  <GameCard game={box.game} to={`/catalogue/${box.game.id}`}>
                    <div className="text-small">
                      <PersonIcon />
                      Eigenaar: {userNames.get(box.ownerId) ?? '…'}
                    </div>
                    <p className="text-small text-muted lending-hint">{box.condition}</p>
                    <BoxAvailabilityBadge isOnLoan={box.isOnLoan} />
                    {box.ownerId === member?.id && <BoxCardActions box={box} />}
                    {box.ownerId !== member?.id && !box.isOnLoan && (
                      <RequestBoxButton box={box} isRequested={requestedBoxIds.has(box.id)} />
                    )}
                  </GameCard>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {isOffering && <BoxFormModal onClose={() => setIsOffering(false)} />}
    </>
  )
}
