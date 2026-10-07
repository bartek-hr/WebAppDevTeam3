import { Alert, Breadcrumb, Col, Row } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import { getErrorMessage, isNotFound } from '../../api/errors'
import BoxImage from '../../components/BoxImage'
import PageSpinner from '../../components/PageSpinner'
import { formatEdition, formatPlayers, formatPlayingTime } from '../../utils/format'
import { useGame, useGames } from './api'
import { findOtherEditions } from './gameSchema'

export default function GameDetailPage() {
  const { id } = useParams()
  const gameId = Number(id)
  const { data: game, isLoading, error } = useGame(gameId)
  const { data: games = [] } = useGames()

  if (isLoading) return <PageSpinner />
  if (!game) {
    const notFound = !Number.isInteger(gameId) || isNotFound(error)
    return (
      <Alert variant={notFound ? 'warning' : 'danger'}>
        {notFound
          ? 'Deze game staat niet in de catalogus.'
          : `De game kon niet geladen worden. ${getErrorMessage(error)}`}
        <div className="mt-2">
          <Link to="/catalogue">Terug naar de catalogus</Link>
        </div>
      </Alert>
    )
  }

  const otherEditions = findOtherEditions(games, game)

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/catalogue' }}>
          Catalogus
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{game.title}</Breadcrumb.Item>
      </Breadcrumb>

      <Row className="g-4">
        <Col md={4}>
          <BoxImage game={game} height={280} className="rounded border" />
        </Col>
        <Col md={8}>
          <h1 className="mb-1">{game.title}</h1>
          <p className="lead text-body-secondary">{formatEdition(game)}</p>
          <dl className="row">
            <dt className="col-sm-4">Uitgever</dt>
            <dd className="col-sm-8">{game.publisher}</dd>
            <dt className="col-sm-4">Jaar van uitgave</dt>
            <dd className="col-sm-8">{game.releaseYear}</dd>
            <dt className="col-sm-4">Categorie</dt>
            <dd className="col-sm-8">{game.category}</dd>
            <dt className="col-sm-4">Aantal spelers</dt>
            <dd className="col-sm-8">{formatPlayers(game)}</dd>
            <dt className="col-sm-4">Speelduur</dt>
            <dd className="col-sm-8">{formatPlayingTime(game.playingTimeMinutes)}</dd>
          </dl>

          {otherEditions.length > 0 && (
            <section>
              <h2 className="h6">Andere edities in de catalogus</h2>
              <ul className="mb-0">
                {otherEditions.map((edition) => (
                  <li key={edition.id}>
                    <Link to={`/catalogue/${edition.id}`}>
                      {edition.title} ({formatEdition(edition)})
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {/* Later: wie heeft deze game, welke dozen zijn te leen en op welke verlanglijsten staat hij */}
        </Col>
      </Row>
    </>
  )
}
