import type { ReactNode } from 'react'
import { Badge, Card } from 'react-bootstrap'
import { Clock, People } from 'react-bootstrap-icons'
import { Link } from 'react-router-dom'
import type { Game } from '../types'
import { formatEdition, formatPlayers, formatPlayingTime } from '../utils/format'
import BoxImage from './BoxImage'

interface GameCardProps {
  game: Game
  // Maakt de hele kaart klikbaar, bijv. to={`/catalogue/${game.id}`}
  to?: string
  // Extra inhoud onderaan de kaart, bijv. knoppen of een status
  children?: ReactNode
}

// Herbruikbare kaart voor een game (catalogus, planken, uitleenlijst, ...)
export default function GameCard({ game, to, children }: GameCardProps) {
  return (
    <Card className="h-100 shadow-sm">
      <BoxImage game={game} className="card-img-top" />
      <Card.Body className="d-flex flex-column">
        <Card.Title as="h3" className="h6 mb-1">
          {to ? (
            <Link to={to} className="stretched-link text-reset text-decoration-none">
              {game.title}
            </Link>
          ) : (
            game.title
          )}
        </Card.Title>
        <Card.Subtitle className="small text-body-secondary mb-3">
          {formatEdition(game)}
        </Card.Subtitle>
        <div className="mt-auto d-flex flex-wrap gap-1">
          <Badge bg="primary-subtle" text="primary-emphasis">
            {game.category}
          </Badge>
          <Badge bg="light" text="dark" className="border">
            <People className="me-1" />
            {formatPlayers(game)}
          </Badge>
          <Badge bg="light" text="dark" className="border">
            <Clock className="me-1" />
            {formatPlayingTime(game.playingTimeMinutes)}
          </Badge>
        </div>
        {/* Boven de stretched-link, zodat knoppen klikbaar blijven */}
        {children && (
          <div className="mt-3 position-relative" style={{ zIndex: 2 }}>
            {children}
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
