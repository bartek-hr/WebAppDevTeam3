import type { Game } from '../types'
import { BoxIcon } from './icons'
import './BoxImage.css'

interface BoxImageProps {
  game: Pick<Game, 'title' | 'boxImageUrl'>
  height?: number
  // Extra classes, bijv. "card__img" in een kaart of "box-image--framed" (rand en ronde hoeken)
  className?: string
}

// Foto van de doos, of een placeholder als niemand een foto heeft
export default function BoxImage({ game, height = 160, className }: BoxImageProps) {
  if (game.boxImageUrl) {
    return (
      <img
        src={game.boxImageUrl}
        alt={`Doos van ${game.title}`}
        className={['box-image', className].filter(Boolean).join(' ')}
        style={{ height }}
      />
    )
  }
  return (
    <div
      className={['box-image', 'box-image--placeholder', className].filter(Boolean).join(' ')}
      style={{ height }}
      aria-hidden="true"
    >
      <BoxIcon size={Math.round(height / 3)} />
    </div>
  )
}
