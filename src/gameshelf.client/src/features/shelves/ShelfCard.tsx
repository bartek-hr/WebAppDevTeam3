import type { ReactNode } from 'react'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import type { Shelf } from '../../types'
import ShelfVisibility from './ShelfVisibility'

// Plank als kaart, voor "mijn planken" en het profiel van een lid
export default function ShelfCard({ shelf, actions }: { shelf: Shelf; actions?: ReactNode }) {
  return (
    <Card className="h-100 shadow-sm">
      <Card.Body className="d-flex flex-column">
        <div className="d-flex align-items-start justify-content-between gap-2">
          <Card.Title as="h3" className="h5 mb-1">
            <Link to={`/shelves/${shelf.id}`}>{shelf.name}</Link>
          </Card.Title>
          <ShelfVisibility isPublic={shelf.isPublic} />
        </div>
        {shelf.description && (
          <Card.Text className="small text-body-secondary">{shelf.description}</Card.Text>
        )}
        <div className="mt-auto d-flex align-items-center justify-content-between">
          <span className="small text-body-secondary">
            {shelf.recordIds.length} {shelf.recordIds.length === 1 ? 'game' : 'games'}
          </span>
          {actions && <div className="d-flex gap-1">{actions}</div>}
        </div>
      </Card.Body>
    </Card>
  )
}
