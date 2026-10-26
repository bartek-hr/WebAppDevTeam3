import { Link, useSearchParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import Alert from '../../components/Alert'
import GameCard from '../../components/GameCard'
import { PlusIcon } from '../../components/icons'
import PageSpinner from '../../components/PageSpinner'
import { useGames } from './api'

const PLAYER_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8]

export default function CataloguePage() {
  const { data: games, isLoading, isError, error } = useGames()
  // Filters staan in de URL, zodat "terug" en delen van een link ze bewaren
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const players = Number(searchParams.get('players')) || 0

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

  const categories = [...new Set(games?.map((game) => game.category))].sort((a, b) =>
    a.localeCompare(b, 'nl'),
  )
  const search = query.trim().toLowerCase()
  const filtered = (games ?? [])
    .filter(
      (game) =>
        !search ||
        game.title.toLowerCase().includes(search) ||
        game.publisher.toLowerCase().includes(search),
    )
    .filter((game) => !category || game.category === category)
    .filter((game) => !players || (game.minPlayers <= players && players <= game.maxPlayers))
    .sort((a, b) => a.title.localeCompare(b.title, 'nl') || a.releaseYear - b.releaseYear)

  return (
    <>
      <div className="page-header">
        <h1>Catalogus</h1>
        <Link to="/catalogue/new" className="btn btn--primary">
          <PlusIcon />
          Game toevoegen
        </Link>
      </div>
      <p className="text-muted">
        Elke editie is een eigen game: de Nederlandse en de Engelse doos van dezelfde titel staan
        hier apart.
      </p>

      <form role="search" className="filter-bar" onSubmit={(event) => event.preventDefault()}>
        <input
          type="search"
          className="input filter-bar__search"
          placeholder="Zoek op titel of uitgever"
          aria-label="Zoek op titel of uitgever"
          value={query}
          onChange={(event) => setFilter('q', event.target.value)}
        />
        <select
          className="input"
          aria-label="Categorie"
          value={category}
          onChange={(event) => setFilter('category', event.target.value)}
        >
          <option value="">Alle categorieën</option>
          {categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select
          className="input"
          aria-label="Aantal spelers"
          value={players || ''}
          onChange={(event) => setFilter('players', event.target.value)}
        >
          <option value="">Elk aantal spelers</option>
          {PLAYER_COUNTS.map((count) => (
            <option key={count} value={count}>
              Geschikt voor {count} {count === 1 ? 'speler' : 'spelers'}
            </option>
          ))}
        </select>
      </form>

      {isLoading && <PageSpinner />}
      {isError && (
        <Alert variant="danger">
          De catalogus kon niet geladen worden. {getErrorMessage(error)}
        </Alert>
      )}
      {games && (
        <>
          <p className="text-small text-muted">
            {filtered.length} van {games.length} games
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
            <div className="card-grid">
              {filtered.map((game) => (
                <GameCard key={game.id} game={game} to={`/catalogue/${game.id}`} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
