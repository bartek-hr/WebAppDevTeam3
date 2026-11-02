import { Link, useSearchParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import Alert from '../../components/Alert'
import GameCard from '../../components/GameCard'
import PageSpinner from '../../components/PageSpinner'
import { useMembers } from '../auth/api'
import { useWishlistsPreview } from './wishlistsPreviewApi'

// #26: overzicht en filters; gedeelde mockdata en eigen verlanglijst volgen vanuit #25.
export default function WishlistsPage() {
  const itemsQuery = useWishlistsPreview()
  const membersQuery = useMembers()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const memberId = searchParams.get('member') ?? ''

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

  const members = [...(membersQuery.data ?? [])].sort((a, b) =>
    a.userName.localeCompare(b.userName, 'nl'),
  )
  const userNames = new Map(members.map((member) => [member.id, member.userName]))
  const items = itemsQuery.data ?? []
  const search = query.trim().toLowerCase()
  const filtered = items
    .filter((item) => !search || item.game.title.toLowerCase().includes(search))
    .filter((item) => !memberId || item.ownerId === memberId)
    .sort((a, b) => a.priority - b.priority || a.id - b.id)
  const isLoading = itemsQuery.isLoading || membersQuery.isLoading
  const isError = itemsQuery.isError || membersQuery.isError

  return (
    <>
      <div className="page-header">
        <h1>Verlanglijsten</h1>
        <Link to="/wishlists/mine" className="btn btn--outline-primary">
          Mijn verlanglijst
        </Link>
      </div>
      <p className="text-muted">Ontdek welke games de leden graag willen hebben.</p>
      <form role="search" className="filter-bar" onSubmit={(event) => event.preventDefault()}>
        <input
          type="search"
          className="input filter-bar__search"
          aria-label="Zoek op game"
          placeholder="Zoek op game"
          value={query}
          onChange={(event) => setFilter('q', event.target.value)}
        />
        <select
          className="input"
          aria-label="Lid"
          value={memberId}
          onChange={(event) => setFilter('member', event.target.value)}
        >
          <option value="">Alle leden</option>
          {memberId && !userNames.has(memberId) && <option value={memberId}>Onbekend lid</option>}
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.userName}
            </option>
          ))}
        </select>
      </form>
      {isLoading && <PageSpinner />}
      {isError && (
        <Alert variant="danger">
          De verlanglijsten konden niet geladen worden.{' '}
          {getErrorMessage(itemsQuery.error ?? membersQuery.error)}{' '}
          <button
            type="button"
            className="btn btn--link"
            onClick={() => {
              void itemsQuery.refetch()
              void membersQuery.refetch()
            }}
          >
            Opnieuw proberen
          </button>
        </Alert>
      )}
      {!isLoading && !isError && (
        <>
          <p className="text-small text-muted" role="status">
            {filtered.length} van {items.length} wensen
          </p>
          {items.length === 0 ? (
            <Alert variant="neutral">Er staan nog geen games op de verlanglijsten.</Alert>
          ) : filtered.length === 0 ? (
            <Alert variant="neutral">
              Geen wensen gevonden met deze filters.{' '}
              <button
                type="button"
                className="btn btn--link"
                onClick={() => {
                  setSearchParams(
                    (params) => {
                      params.delete('q')
                      params.delete('member')
                      return params
                    },
                    { replace: true },
                  )
                }}
              >
                Filters wissen
              </button>
            </Alert>
          ) : (
            <div className="card-grid">
              {filtered.map((item) => (
                <GameCard key={item.id} game={item.game} to={`/catalogue/${item.game.id}`}>
                  <div>
                    Lid:{' '}
                    <Link to={`/members/${encodeURIComponent(item.ownerId)}`}>
                      {userNames.get(item.ownerId) ?? 'Onbekend lid'}
                    </Link>
                  </div>
                  <span className="badge badge--outline">Prioriteit {item.priority}</span>
                  {item.isFulfilled && <span className="badge badge--success">Vervuld</span>}
                  {item.note && <p className="card__text">{item.note}</p>}
                </GameCard>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
