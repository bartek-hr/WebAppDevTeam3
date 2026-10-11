import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Form, Modal } from 'react-bootstrap'
import { useForm, useWatch } from 'react-hook-form'
import { getErrorMessage } from '../../api/errors'
import type { CollectionRecord } from '../../types'
import { useUpdateCollectionRecord } from './api'
import { MAX_IN_PROGRESS, MAX_RATING, STATUSES, STATUS_LABELS } from './collectionRules'
import { recordSchema, type RecordInput } from './recordSchema'

export default function EditCollectionModal({
  record,
  records,
  onClose,
}: {
  record: CollectionRecord
  records: CollectionRecord[]
  onClose: () => void
}) {
  const update = useUpdateCollectionRecord()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RecordInput>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      status: record.status,
      plays: record.plays,
      rating: record.rating,
      note: record.note ?? '',
    },
  })
  const status = useWatch({ control, name: 'status' })
  const atLimit =
    records.filter((r) => r.id !== record.id && r.status === 'InProgress').length >= MAX_IN_PROGRESS
  return (
    <Modal show onHide={onClose} aria-labelledby="edit-record-title">
      <Modal.Header closeButton>
        <Modal.Title id="edit-record-title">{record.game.title} bewerken</Modal.Title>
      </Modal.Header>
      <Form
        noValidate
        onSubmit={handleSubmit(async (values) => {
          try {
            await update.mutateAsync({
              id: record.id,
              ...values,
              rating: values.status === 'Played' ? values.rating : undefined,
            })
            onClose()
          } catch {
            /* Fout hieronder */
          }
        })}
      >
        <Modal.Body>
          {update.isError && <Alert variant="danger">{getErrorMessage(update.error)}</Alert>}
          <Form.Group controlId="record-status" className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select {...register('status')} disabled={update.isPending}>
              {STATUSES.map((s) => (
                <option key={s} value={s} disabled={s === 'InProgress' && atLimit}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Form.Select>
            {atLimit && <Form.Text>Maak eerst een campagne af.</Form.Text>}
          </Form.Group>
          <Form.Group controlId="record-rating" className="mb-3">
            <Form.Label>Beoordeling</Form.Label>
            <Form.Select
              disabled={status !== 'Played' || update.isPending}
              isInvalid={!!errors.rating}
              {...register('rating', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })}
            >
              <option value="">Geen beoordeling</option>
              {Array.from({ length: MAX_RATING }, (_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1} sterren
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.rating?.message}</Form.Control.Feedback>
            {status !== 'Played' && <Form.Text>Eerst spelen, dan beoordelen.</Form.Text>}
          </Form.Group>
          <Form.Group controlId="record-note">
            <Form.Label>Notitie</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              isInvalid={!!errors.note}
              {...register('note')}
              disabled={update.isPending}
            />
            <Form.Control.Feedback type="invalid">{errors.note?.message}</Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" disabled={update.isPending} onClick={onClose}>
            Annuleren
          </Button>
          <Button type="submit" disabled={update.isPending}>
            Opslaan
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
