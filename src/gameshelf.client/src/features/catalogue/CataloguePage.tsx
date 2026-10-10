import { Alert, Button, Col, Form, Row } from 'react-bootstrap'
import { PlusLg } from 'react-bootstrap-icons'
import { Link, useSearchParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import GameCard from '../../components/GameCard'
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
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
        <h1 className="mb-0">Catalogus</h1>
        <Link to="/catalogue/new" className="btn btn-primary">
          <PlusLg className="me-1" />
          Game toevoegen
        </Link>
      </div>
      <p className="text-body-secondary">
        Elke editie is een eigen game: de Nederlandse en de Engelse doos van dezelfde titel staan
        hier apart.
      </p>

      <Form role="search" className="row g-2 mb-3" onSubmit={(event) => event.preventDefault()}>
        <Col md={6}>
          <Form.Control
            type="search"
            placeholder="Zoek op titel of uitgever"
            aria-label="Zoek op titel of uitgever"
            value={query}
            onChange={(event) => setFilter('q', event.target.value)}
          />
        </Col>
        <Col sm={6} md={3}>
          <Form.Select
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
          </Form.Select>
        </Col>
        <Col sm={6} md={3}>
          <Form.Select
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
          </Form.Select>
        </Col>
      </Form>

      {isLoading && <PageSpinner />}
      {isError && (
        <Alert variant="danger">
          De catalogus kon niet geladen worden. {getErrorMessage(error)}
        </Alert>
      )}
      {games && (
        <>
          <p className="small text-body-secondary">
            {filtered.length} van {games.length} games
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
            <Row xs={1} sm={2} md={3} lg={4} className="g-3">
              {filtered.map((game) => (
                <Col key={game.id}>
                  <GameCard game={game} to={`/catalogue/${game.id}`} />
                </Col>
              ))}
            </Row>
          )}
        </>
      )}
    </>
  )
}
