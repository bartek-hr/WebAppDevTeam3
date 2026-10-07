import { BoxSeam } from 'react-bootstrap-icons'
import type { Game } from '../types'

interface BoxImageProps {
  game: Pick<Game, 'title' | 'boxImageUrl'>
  height?: number
  className?: string
}

// Foto van de doos, of een placeholder als niemand een foto heeft
export default function BoxImage({ game, height = 160, className = '' }: BoxImageProps) {
  if (game.boxImageUrl) {
    return (
      <img
        src={game.boxImageUrl}
        alt={`Doos van ${game.title}`}
        className={`w-100 bg-body-tertiary ${className}`}
        style={{ height, objectFit: 'contain' }}
      />
    )
  }
  return (
    <div
      className={`d-flex align-items-center justify-content-center bg-body-secondary text-body-tertiary ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      <BoxSeam size={Math.round(height / 3)} />
    </div>
  )
}
