import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { getErrorMessage } from '../../api/errors'
import Alert from '../../components/Alert'
import Modal from '../../components/Modal'
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
    <Modal title={`${record.game.title} bewerken`} onClose={onClose}>
      <form
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
        <div className="modal__body">
          {update.isError && <Alert variant="danger">{getErrorMessage(update.error)}</Alert>}
          <div className="field">
            <label htmlFor="record-status" className="field__label">
              Status
            </label>
            <select
              id="record-status"
              className="input"
              {...register('status')}
              disabled={update.isPending}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s} disabled={s === 'InProgress' && atLimit}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            {atLimit && <small className="field__hint">Maak eerst een campagne af.</small>}
          </div>
          <div className="field">
            <label htmlFor="record-rating" className="field__label">
              Beoordeling
            </label>
            <select
              id="record-rating"
              className="input"
              disabled={status !== 'Played' || update.isPending}
              aria-invalid={!!errors.rating}
              aria-describedby={errors.rating ? 'record-rating-error' : undefined}
              {...register('rating', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })}
            >
              <option value="">Geen beoordeling</option>
              {Array.from({ length: MAX_RATING }, (_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1} sterren
                </option>
              ))}
            </select>
            {errors.rating && (
              <div id="record-rating-error" className="field__error">
                {errors.rating.message}
              </div>
            )}
            {status !== 'Played' && (
              <small className="field__hint">Eerst spelen, dan beoordelen.</small>
            )}
          </div>
          <div className="field">
            <label htmlFor="record-note" className="field__label">
              Notitie
            </label>
            <textarea
              id="record-note"
              className="input"
              rows={3}
              aria-invalid={!!errors.note}
              aria-describedby={errors.note ? 'record-note-error' : undefined}
              {...register('note')}
              disabled={update.isPending}
            />
            {errors.note && (
              <div id="record-note-error" className="field__error">
                {errors.note.message}
              </div>
            )}
          </div>
        </div>
        <div className="modal__footer">
          <button
            type="button"
            className="btn btn--secondary"
            disabled={update.isPending}
            onClick={onClose}
          >
            Annuleren
          </button>
          <button type="submit" className="btn btn--primary" disabled={update.isPending}>
            Opslaan
          </button>
        </div>
      </form>
    </Modal>
  )
}
