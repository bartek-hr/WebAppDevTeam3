import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Form, Modal } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { getErrorMessage } from '../../api/errors'
import type { Shelf } from '../../types'
import { useSaveShelf } from './api'
import { shelfSchema, type ShelfInput } from './shelfSchema'

export default function ShelfFormModal({ shelf, onClose }: { shelf?: Shelf; onClose: () => void }) {
  const save = useSaveShelf()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShelfInput>({
    resolver: zodResolver(shelfSchema),
    defaultValues: {
      name: shelf?.name ?? '',
      description: shelf?.description ?? '',
      isPublic: shelf?.isPublic ?? false,
    },
  })
  return (
    <Modal show onHide={onClose} aria-labelledby="shelf-form-title">
      <Modal.Header closeButton>
        <Modal.Title id="shelf-form-title">
          {shelf ? 'Plank bewerken' : 'Plank aanmaken'}
        </Modal.Title>
      </Modal.Header>
      <Form
        noValidate
        onSubmit={handleSubmit(async (values) => {
          try {
            await save.mutateAsync({ ...values, id: shelf?.id })
            onClose()
          } catch {
            /* Fout hieronder */
          }
        })}
      >
        <Modal.Body>
          {save.isError && <Alert variant="danger">{getErrorMessage(save.error)}</Alert>}
          <Form.Group controlId="shelf-name" className="mb-3">
            <Form.Label>Naam</Form.Label>
            <Form.Control
              autoFocus
              {...register('name')}
              isInvalid={!!errors.name}
              disabled={save.isPending}
            />
            <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="shelf-description" className="mb-3">
            <Form.Label>Beschrijving</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              {...register('description')}
              isInvalid={!!errors.description}
              disabled={save.isPending}
            />
            <Form.Control.Feedback type="invalid">
              {errors.description?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Check
            type="switch"
            id="shelf-public"
            label="Openbaar"
            {...register('isPublic')}
            disabled={save.isPending}
          />
          <Form.Text>Een privé-plank is alleen zichtbaar voor jou.</Form.Text>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" disabled={save.isPending} onClick={onClose}>
            Annuleren
          </Button>
          <Button type="submit" disabled={save.isPending}>
            Opslaan
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
