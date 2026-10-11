import { Alert, Button, Modal } from 'react-bootstrap'
import { getErrorMessage } from '../../api/errors'
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
    <Modal show onHide={onClose} aria-labelledby="remove-collection-title">
      <Modal.Header closeButton>
        <Modal.Title id="remove-collection-title">Game verwijderen</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={remove.isPending}>
          Annuleren
        </Button>
        <Button
          variant="danger"
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
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
