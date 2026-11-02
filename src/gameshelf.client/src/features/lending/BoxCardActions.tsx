import { useState } from 'react'
import { EditIcon, TrashIcon } from '../../components/icons'
import type { Box } from '../../types'
import BoxFormModal from './BoxFormModal'
import RemoveBoxModal from './RemoveBoxModal'

interface BoxCardActionsProps {
  box: Box
}

// Knoppen voor de eigenaar van een doos; zolang de doos is uitgeleend kan er niets
export default function BoxCardActions({ box }: BoxCardActionsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  return (
    <>
      <div className="cluster lending-space-top">
        <button
          type="button"
          className="btn btn--outline-primary btn--sm"

          disabled={box.isOnLoan}
          onClick={() => setIsEditing(true)}
        >
          <EditIcon />
          Bewerken
        </button>
        <button
          type="button"
          className="btn btn--outline-danger btn--sm"

          disabled={box.isOnLoan}
          onClick={() => setIsRemoving(true)}
        >
          <TrashIcon />
          Van de lijst halen
        </button>
      </div>
      {box.isOnLoan && (
        <div className="text-small text-muted lending-hint">
          Kan niet zolang de doos is uitgeleend
        </div>
      )}

      {isEditing && <BoxFormModal box={box} onClose={() => setIsEditing(false)} />}
      {isRemoving && <RemoveBoxModal box={box} onClose={() => setIsRemoving(false)} />}
    </>
  )
}
