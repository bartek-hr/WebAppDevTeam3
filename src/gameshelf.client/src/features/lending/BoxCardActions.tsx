import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { PencilSquare } from 'react-bootstrap-icons'
import type { Box } from '../../types'
import BoxFormModal from './BoxFormModal'

interface BoxCardActionsProps {
  box: Box
}

// Knoppen voor de eigenaar van een doos; zolang de doos is uitgeleend kan er niets
export default function BoxCardActions({ box }: BoxCardActionsProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <>
      <div className="d-flex flex-wrap gap-2 mt-2">
        <Button
          size="sm"
          variant="outline-primary"
          disabled={box.isOnLoan}
          onClick={() => setIsEditing(true)}
        >
          <PencilSquare className="me-1" />
          Bewerken
        </Button>
      </div>
      {box.isOnLoan && (
        <div className="small text-body-secondary mt-1">Kan niet zolang de doos is uitgeleend</div>
      )}

      {isEditing && <BoxFormModal box={box} onClose={() => setIsEditing(false)} />}
    </>
  )
}
