import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Game } from '../types'
import { formatEdition, formatPlayers, formatPlayingTime } from '../utils/format'
import BoxImage from './BoxImage'
import { ClockIcon, PeopleIcon } from './icons'
import './GameCard.css'

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
    <div className="card">
      <BoxImage game={game} className="card__img" />
      <div className="card__body">
        <h3 className="card__title game-card__title">
          {to ? (
            <Link to={to} className="card__link">
              {game.title}
            </Link>
          ) : (
            game.title
          )}
        </h3>
        <div className="card__subtitle">{formatEdition(game)}</div>
        <div className="card__footer cluster cluster--tight">
          <span className="badge badge--primary">{game.category}</span>
          <span className="badge badge--outline">
            <PeopleIcon />
            {formatPlayers(game)}
          </span>
          <span className="badge badge--outline">
            <ClockIcon />
            {formatPlayingTime(game.playingTimeMinutes)}
          </span>
        </div>
        {/* Boven de link die de hele kaart bedekt, zodat knoppen klikbaar blijven */}
        {children && <div className="card__actions game-card__actions">{children}</div>}
      </div>
    </div>
  )
}
