import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { getErrorMessage } from '../../api/errors'
import Alert from '../../components/Alert'
import GamePicker from '../../components/GamePicker'
import Modal from '../../components/Modal'
import { useAddToCollection } from './api'

const schema = z.object({ gameId: z.number().int().positive('Kies een game.') })

export default function AddCollectionModal({
  excludeIds,
  onClose,
}: {
  excludeIds: number[]
  onClose: () => void
}) {
  const add = useAddToCollection()
  const { control, handleSubmit } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  })
  return (
    <Modal title="Game toevoegen" onClose={onClose}>
      <form
        onSubmit={handleSubmit(async ({ gameId }) => {
          try {
            await add.mutateAsync(gameId)
            onClose()
          } catch {
            /* Fout hieronder */
          }
        })}
      >
        <div className="modal__body">
          {add.isError && <Alert variant="danger">{getErrorMessage(add.error)}</Alert>}
          <div className="field">
            <label htmlFor="collection-game" className="field__label">
              Game
            </label>
            <Controller
              name="gameId"
              control={control}
              render={({ field, fieldState }) => (
                <GamePicker
                  id="collection-game"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  excludeIds={excludeIds}
                  disabled={add.isPending}
                />
              )}
            />
          </div>
        </div>
        <div className="modal__footer">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onClose}
            disabled={add.isPending}
          >
            Annuleren
          </button>
          <button type="submit" className="btn btn--primary" disabled={add.isPending}>
            Toevoegen
          </button>
        </div>
      </form>
    </Modal>
  )
}
