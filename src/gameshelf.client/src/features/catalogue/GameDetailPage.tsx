import { Link, useParams } from 'react-router-dom'
import { getErrorMessage, isNotFound } from '../../api/errors'
import Alert from '../../components/Alert'
import BoxImage from '../../components/BoxImage'
import PageSpinner from '../../components/PageSpinner'
import { formatEdition, formatPlayers, formatPlayingTime } from '../../utils/format'
import { useGame, useGames } from './api'
import { findOtherEditions } from './gameSchema'
import './GameDetailPage.css'

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
        <div className="game-detail-page__back">
          <Link to="/catalogue">Terug naar de catalogus</Link>
        </div>
      </Alert>
    )
  }

  const otherEditions = findOtherEditions(games, game)

  return (
    <>
      <nav aria-label="Kruimelpad">
        <ol className="breadcrumb">
          <li>
            <Link to="/catalogue">Catalogus</Link>
          </li>
          <li aria-current="page">{game.title}</li>
        </ol>
      </nav>

      <div className="detail-layout">
        <div>
          <BoxImage game={game} height={280} className="box-image--framed" />
        </div>
        <div>
          <h1 className="game-detail-page__title">{game.title}</h1>
          <p className="game-detail-page__edition">{formatEdition(game)}</p>
          <dl className="details-list">
            <dt>Uitgever</dt>
            <dd>{game.publisher}</dd>
            <dt>Jaar van uitgave</dt>
            <dd>{game.releaseYear}</dd>
            <dt>Categorie</dt>
            <dd>{game.category}</dd>
            <dt>Aantal spelers</dt>
            <dd>{formatPlayers(game)}</dd>
            <dt>Speelduur</dt>
            <dd>{formatPlayingTime(game.playingTimeMinutes)}</dd>
          </dl>

          {otherEditions.length > 0 && (
            <section>
              <h2 className="game-detail-page__subheading">Andere edities in de catalogus</h2>
              <ul className="game-detail-page__editions">
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
        </div>
      </div>
    </>
  )
}
