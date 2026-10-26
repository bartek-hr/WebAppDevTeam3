import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { getErrorMessage } from '../../api/errors'
import Alert from '../../components/Alert'
import Modal from '../../components/Modal'
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
    <Modal title={shelf ? 'Plank bewerken' : 'Plank aanmaken'} onClose={onClose}>
      <form
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
        <div className="modal__body">
          {save.isError && <Alert variant="danger">{getErrorMessage(save.error)}</Alert>}
          <div className="field">
            <label htmlFor="shelf-name" className="field__label">
              Naam
            </label>
            <input
              id="shelf-name"
              className="input"
              data-autofocus
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'shelf-name-error' : undefined}
              {...register('name')}
              disabled={save.isPending}
            />
            {errors.name && (
              <div id="shelf-name-error" className="field__error">
                {errors.name.message}
              </div>
            )}
          </div>
          <div className="field">
            <label htmlFor="shelf-description" className="field__label">
              Beschrijving
            </label>
            <textarea
              id="shelf-description"
              className="input"
              rows={3}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'shelf-description-error' : undefined}
              {...register('description')}
              disabled={save.isPending}
            />
            {errors.description && (
              <div id="shelf-description-error" className="field__error">
                {errors.description.message}
              </div>
            )}
          </div>
          <div className="switch">
            <input
              type="checkbox"
              role="switch"
              id="shelf-public"
              className="switch__input"
              {...register('isPublic')}
              disabled={save.isPending}
            />
            <label htmlFor="shelf-public" className="switch__label">
              Openbaar
            </label>
          </div>
        </div>
        <div className="modal__footer">
          <button
            type="button"
            className="btn btn--secondary"
            disabled={save.isPending}
            onClick={onClose}
          >
            Annuleren
          </button>
          <button type="submit" className="btn btn--primary" disabled={save.isPending}>
            Opslaan
          </button>
        </div>
      </form>
    </Modal>
  )
}
