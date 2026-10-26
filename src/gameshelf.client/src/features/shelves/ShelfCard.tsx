import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Shelf } from '../../types'
import ShelfVisibility from './ShelfVisibility'
import './ShelfCard.css'

// Plank als kaart, voor "mijn planken" en het profiel van een lid
export default function ShelfCard({ shelf, actions }: { shelf: Shelf; actions?: ReactNode }) {
  return (
    <div className="card">
      <div className="card__body">
        <div className="shelf-card__header">
          <h3 className="card__title shelf-card__title">
            <Link to={`/shelves/${shelf.id}`}>{shelf.name}</Link>
          </h3>
          <ShelfVisibility isPublic={shelf.isPublic} />
        </div>
        {shelf.description && <p className="card__text">{shelf.description}</p>}
        <div className="card__footer shelf-card__footer">
          <span className="text-small text-muted">
            {shelf.recordIds.length} {shelf.recordIds.length === 1 ? 'game' : 'games'}
          </span>
          {actions && <div className="cluster cluster--tight">{actions}</div>}
        </div>
      </div>
    </div>
  )
}
