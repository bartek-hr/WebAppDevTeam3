import { getErrorMessage } from '../../api/errors'
import Alert from '../../components/Alert'
import Modal from '../../components/Modal'
import type { CollectionRecord } from '../../types'
import { useRecordShelves, useRemoveFromCollection } from './api'

export default function RemoveCollectionModal({
  record,
  onClose,
}: {
  record: CollectionRecord
  onClose: () => void
}) {
  const shelves = useRecordShelves(record.id)
  const remove = useRemoveFromCollection()
  return (
    <Modal title="Game verwijderen" onClose={onClose}>
      <div className="modal__body">
        <p>Wil je {record.game.title} uit je collectie verwijderen?</p>
        {shelves.isLoading && <p>Planken laden…</p>}
        {shelves.isError && <Alert variant="danger">{getErrorMessage(shelves.error)}</Alert>}
        {shelves.data && (
          <p>
            {shelves.data.length
              ? `De game verdwijnt ook van deze planken: ${shelves.data.map((s) => s.name).join(', ')}.`
              : 'De game staat op geen enkele plank.'}
          </p>
        )}
        {remove.isError && <Alert variant="danger">{getErrorMessage(remove.error)}</Alert>}
      </div>
      <div className="modal__footer">
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onClose}
          disabled={remove.isPending}
        >
          Annuleren
        </button>
        <button
          type="button"
          className="btn btn--danger"
          disabled={!shelves.data || remove.isPending}
          onClick={async () => {
            try {
              await remove.mutateAsync(record.id)
              onClose()
            } catch {
              /* Fout hierboven */
            }
          }}
        >
          Verwijderen
        </button>
      </div>
    </Modal>
  )
}
