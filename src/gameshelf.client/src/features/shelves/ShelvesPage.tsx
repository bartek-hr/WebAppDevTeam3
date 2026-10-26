import { useState } from 'react'
import { getErrorMessage } from '../../api/errors'
import Alert from '../../components/Alert'
import IconButton from '../../components/IconButton'
import Modal from '../../components/Modal'
import PageSpinner from '../../components/PageSpinner'
import { EditIcon, PlusIcon, TrashIcon } from '../../components/icons'
import type { Shelf } from '../../types'
import { useDeleteShelf, useMyShelves } from './api'
import ShelfCard from './ShelfCard'
import ShelfFormModal from './ShelfFormModal'

// Eigenaar: Joran (zie docs/TAAKVERDELING.md)
export default function ShelvesPage() {
  const query = useMyShelves()
  const remove = useDeleteShelf()
  const [editing, setEditing] = useState<Shelf | 'new' | null>(null)
  const [removing, setRemoving] = useState<Shelf | null>(null)
  return (
    <>
      <div className="page-header">
        <h1>Mijn planken</h1>
        <button type="button" className="btn btn--primary" onClick={() => setEditing('new')}>
          <PlusIcon />
          Plank aanmaken
        </button>
      </div>
      {query.isLoading && <PageSpinner />}
      {query.isError && <Alert variant="danger">{getErrorMessage(query.error)}</Alert>}
      {query.data?.length === 0 && <Alert variant="neutral">Je hebt nog geen planken.</Alert>}
      <div className="card-grid card-grid--wide">
        {query.data?.map((shelf) => (
          <ShelfCard
            key={shelf.id}
            shelf={shelf}
            actions={
              <>
                <IconButton
                  variant="outline-primary"
                  icon={<EditIcon />}
                  tooltip="Bewerken"
                  label={`Bewerk ${shelf.name}`}
                  onClick={() => setEditing(shelf)}
                />
                <IconButton
                  variant="outline-danger"
                  icon={<TrashIcon />}
                  tooltip="Verwijderen"
                  label={`Verwijder ${shelf.name}`}
                  onClick={() => {
                    remove.reset()
                    setRemoving(shelf)
                  }}
                />
              </>
            }
          />
        ))}
      </div>
      {editing && (
        <ShelfFormModal
          shelf={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
      {removing && (
        <Modal title="Plank verwijderen" onClose={() => setRemoving(null)}>
          <div className="modal__body">
            <p>{removing.name} verwijderen? De games blijven in je collectie.</p>
            {remove.isError && <Alert variant="danger">{getErrorMessage(remove.error)}</Alert>}
          </div>
          <div className="modal__footer">
            <button
              type="button"
              className="btn btn--secondary"
              disabled={remove.isPending}
              onClick={() => setRemoving(null)}
            >
              Annuleren
            </button>
            <button
              type="button"
              className="btn btn--danger"
              disabled={remove.isPending}
              onClick={async () => {
                try {
                  await remove.mutateAsync(removing.id)
                  setRemoving(null)
                } catch {
                  /* Fout hierboven */
                }
              }}
            >
              Verwijderen
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
