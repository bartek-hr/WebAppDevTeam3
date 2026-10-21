import { Alert, Button, Modal } from 'react-bootstrap'
import { getErrorMessage } from '../../api/errors'
import type { Box } from '../../types'
import { formatEdition } from '../../utils/format'
import { useDeleteBox } from './api'

interface RemoveBoxModalProps {
  box: Box
  onClose: () => void
}

export default function RemoveBoxModal({ box, onClose }: RemoveBoxModalProps) {
  const deleteBox = useDeleteBox()

  return (
    <Modal show onHide={onClose} aria-labelledby="remove-box-title">
      <Modal.Header closeButton>
        <Modal.Title id="remove-box-title">Doos van de lijst halen</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {deleteBox.isError && <Alert variant="danger">{getErrorMessage(deleteBox.error)}</Alert>}
        <p className="mb-0">
          Weet je zeker dat je {box.game.title} ({formatEdition(box.game)}) van de uitleenlijst wilt
          halen? Openstaande aanvragen voor deze doos worden afgewezen.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>
          Annuleren
        </Button>
        <Button
          variant="danger"
          disabled={deleteBox.isPending}
          onClick={() => deleteBox.mutate(box.id, { onSuccess: onClose })}
        >
          {deleteBox.isPending ? 'Bezig met weghalen…' : 'Van de lijst halen'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
