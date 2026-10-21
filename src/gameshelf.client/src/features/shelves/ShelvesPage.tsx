import { useState } from 'react'
import { Alert, Button, Col, Modal, Row } from 'react-bootstrap'
import { PencilSquare, PlusLg, Trash } from 'react-bootstrap-icons'
import { getErrorMessage } from '../../api/errors'
import IconButton from '../../components/IconButton'
import PageSpinner from '../../components/PageSpinner'
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
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h1 className="mb-0">Mijn planken</h1>
        <Button onClick={() => setEditing('new')}>
          <PlusLg className="me-1" />
          Plank aanmaken
        </Button>
      </div>
      {query.isLoading && <PageSpinner />}
      {query.isError && <Alert variant="danger">{getErrorMessage(query.error)}</Alert>}
      {query.data?.length === 0 && (
        <Alert variant="light" className="border">
          Je hebt nog geen planken.
        </Alert>
      )}
      <Row xs={1} md={2} lg={3} className="g-3">
        {query.data?.map((shelf) => (
          <Col key={shelf.id}>
            <ShelfCard
              shelf={shelf}
              actions={
                <>
                  <IconButton
                    variant="outline-primary"
                    icon={<PencilSquare />}
                    tooltip="Bewerken"
                    label={`Bewerk ${shelf.name}`}
                    onClick={() => setEditing(shelf)}
                  />
                  <IconButton
                    variant="outline-danger"
                    icon={<Trash />}
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
          </Col>
        ))}
      </Row>
      {editing && (
        <ShelfFormModal
          shelf={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
      {removing && (
        <Modal show onHide={() => setRemoving(null)} aria-labelledby="delete-shelf-title">
          <Modal.Header closeButton>
            <Modal.Title id="delete-shelf-title">Plank verwijderen</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{removing.name} verwijderen? De games blijven in je collectie.</p>
            {remove.isError && <Alert variant="danger">{getErrorMessage(remove.error)}</Alert>}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              disabled={remove.isPending}
              onClick={() => setRemoving(null)}
            >
              Annuleren
            </Button>
            <Button
              variant="danger"
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
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  )
}
