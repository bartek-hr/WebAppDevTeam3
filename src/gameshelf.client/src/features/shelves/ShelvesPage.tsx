import { useState } from 'react'
import { Alert, Badge, Button, Card, Col, Modal, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import PageSpinner from '../../components/PageSpinner'
import type { Shelf } from '../../types'
import { useDeleteShelf, useMyShelves } from './api'
import ShelfFormModal from './ShelfFormModal'

export default function ShelvesPage() {
  const query = useMyShelves()
  const remove = useDeleteShelf()
  const [editing, setEditing] = useState<Shelf | 'new' | null>(null)
  const [removing, setRemoving] = useState<Shelf | null>(null)
  return (
    <>
      <h1>Mijn planken</h1>
      <p>Orden je collectie op planken. Je games mogen op meerdere planken staan.</p>
      <Button className="mb-3" onClick={() => setEditing('new')}>
        Plank aanmaken
      </Button>
      {query.isLoading && <PageSpinner />}
      {query.isError && <Alert variant="danger">{getErrorMessage(query.error)}</Alert>}
      {query.data?.length === 0 && (
        <Alert variant="light" className="border">
          Je hebt nog geen planken.
        </Alert>
      )}
      <Row className="g-3">
        {query.data?.map((shelf) => (
          <Col key={shelf.id} md={6} lg={4}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title as="h2" className="h5">
                  <Link to={`/shelves/${shelf.id}`}>{shelf.name}</Link>
                </Card.Title>
                <Badge bg={shelf.isPublic ? 'success' : 'secondary'}>
                  {shelf.isPublic ? 'Openbaar' : 'Privé'}
                </Badge>
                <p className="mt-2">{shelf.description}</p>
                <p>{shelf.recordIds.length} games</p>
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    aria-label={`Bewerk ${shelf.name}`}
                    onClick={() => setEditing(shelf)}
                  >
                    Bewerken
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    aria-label={`Verwijder ${shelf.name}`}
                    onClick={() => {
                      remove.reset()
                      setRemoving(shelf)
                    }}
                  >
                    Verwijderen
                  </Button>
                </div>
              </Card.Body>
            </Card>
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
            <p>Wil je {removing.name} verwijderen? De games blijven in je collectie.</p>
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
