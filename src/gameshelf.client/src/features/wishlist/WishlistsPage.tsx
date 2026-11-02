import { Link, useSearchParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import Alert from '../../components/Alert'
import BoxImage from '../../components/BoxImage'
import { ClockIcon, PeopleIcon } from '../../components/icons'
import { formatEdition, formatPlayers, formatPlayingTime } from '../../utils/format'
import PageSpinner from '../../components/PageSpinner'
import { useMembers } from '../auth/api'
import { useWishlistsPreview } from './wishlistsPreviewApi'
import './WishlistsPage.css'

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
    <div className="wishlists-page">
      <div className="page-header wishlists-page__header">
        <h1>Verlanglijsten</h1>
        <Link to="/wishlists/mine" className="btn btn--outline-primary">
          Mijn verlanglijst
        </Link>
      </div>
      <p className="text-muted wishlists-page__intro">
        Ontdek welke games de leden graag willen hebben.
      </p>
      <form
        role="search"
        className="wishlists-page__filters"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="wishlists-page__search">
          <label className="field__label" htmlFor="wishlist-search">
            Zoek op game
          </label>
          <input
            id="wishlist-search"
            type="search"
            className="input"
            placeholder="Bijvoorbeeld Wingspan"
            value={query}
            onChange={(event) => setFilter('q', event.target.value)}
          />
        </div>
        <div>
          <label className="field__label" htmlFor="wishlist-member">
            Lid
          </label>
          <select
            id="wishlist-member"
            className="input"
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
        </div>
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
          <p className="text-small text-muted wishlists-page__count" role="status">
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
            <div className="wishlists-page__grid">
              {filtered.map((item) => (
                <article className="card wishlist-card" key={item.id}>
                  <div className="wishlist-card__heading">
                    <BoxImage game={item.game} height={64} className="wishlist-card__image" />
                    <div className="wishlist-card__title-group">
                      <h2 className="wishlist-card__title">
                        <Link className="card__link" to={`/catalogue/${item.game.id}`}>
                          {item.game.title}
                        </Link>
                      </h2>
                      <p className="wishlist-card__edition">{formatEdition(item.game)}</p>
                    </div>
                  </div>
                  <div className="wishlist-card__details">
                    <div className="cluster cluster--tight">
                      <span className="badge badge--primary">{item.game.category}</span>
                      <span className="badge badge--outline">
                        <PeopleIcon />
                        {formatPlayers(item.game)}
                      </span>
                      <span className="badge badge--outline">
                        <ClockIcon />
                        {formatPlayingTime(item.game.playingTimeMinutes)}
                      </span>
                    </div>
                    {item.note && <p className="wishlist-card__note">{item.note}</p>}
                  </div>
                  <div className="wishlist-card__footer card__actions">
                    <div className="wishlist-card__member">
                      <span className="text-muted">Lid: </span>
                      <Link to={`/members/${encodeURIComponent(item.ownerId)}`}>
                        {userNames.get(item.ownerId) ?? 'Onbekend lid'}
                      </Link>
                    </div>
                    <div className="cluster cluster--tight">
                      <span className="badge badge--outline">Prioriteit {item.priority}</span>
                      {item.isFulfilled && <span className="badge badge--success">Vervuld</span>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
