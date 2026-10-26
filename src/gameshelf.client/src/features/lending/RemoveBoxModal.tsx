import Alert from '../../components/Alert'
import Modal from '../../components/Modal'
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
    <Modal title="Doos van de lijst halen" onClose={onClose}>
      <div className="modal__body">
        {deleteBox.isError && <Alert variant="danger">{getErrorMessage(deleteBox.error)}</Alert>}
        <p className="lending-no-margin">
          Weet je zeker dat je {box.game.title} ({formatEdition(box.game)}) van de uitleenlijst wilt
          halen? Openstaande aanvragen voor deze doos worden afgewezen.
        </p>
      </div>
      <div className="modal__footer">
        <button type="button" className="btn btn--outline-secondary" onClick={onClose}>
          Annuleren
        </button>
        <button
          type="button"
          className="btn btn--danger"

          disabled={deleteBox.isPending}
          onClick={() => deleteBox.mutate(box.id, { onSuccess: onClose })}
        >
          {deleteBox.isPending ? 'Bezig met weghalen…' : 'Van de lijst halen'}
        </button>
      </div>
    </Modal>
  )
}
