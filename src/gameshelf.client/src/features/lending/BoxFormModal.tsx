import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '../../components/Alert'
import Modal from '../../components/Modal'
import { Controller, useForm } from 'react-hook-form'
import { getErrorMessage } from '../../api/errors'
import GamePicker from '../../components/GamePicker'
import type { Box } from '../../types'
import { formatEdition } from '../../utils/format'
import { useCreateBox, useUpdateBox } from './api'
import { boxSchema, type NewBox } from './lendingRules'

interface BoxFormModalProps {
  // Zonder doos bied je een nieuwe doos aan, met doos pas je alleen de staat aan
  box?: Box
  onClose: () => void
}

export default function BoxFormModal({ box, onClose }: BoxFormModalProps) {
  const createBox = useCreateBox()
  const updateBox = useUpdateBox()
  const mutation = box ? updateBox : createBox
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewBox>({
    resolver: zodResolver(boxSchema),
    defaultValues: { gameId: box?.game.id, condition: box?.condition ?? '' },
  })

  const submitLabel = box ? 'Opslaan' : 'Aanbieden'
  const submittingLabel = box ? 'Bezig met opslaan…' : 'Bezig met aanbieden…'

  const onSubmit = async (values: NewBox) => {
    try {
      if (box) await updateBox.mutateAsync({ id: box.id, condition: values.condition })
      else await createBox.mutateAsync(values)
      onClose()
    } catch {
      // De fout staat in de mutation en wordt hieronder getoond
    }
  }

  return (
    <Modal title={box ? 'Doos bewerken' : 'Doos aanbieden'} onClose={onClose}>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="modal__body">
          {mutation.isError && <Alert variant="danger">{getErrorMessage(mutation.error)}</Alert>}

          <div className="field">
            <label className="field__label" htmlFor="box-game">
              Game
            </label>
            {box ? (
              <input
                className="input"
                id="box-game"
                readOnly
                value={`${box.game.title} (${formatEdition(box.game)})`}
              />
            ) : (
              <>
                <Controller
                  name="gameId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <GamePicker
                      id="box-game"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={fieldState.error?.message}
                    />
                  )}
                />
                <small className="field__hint">De game hoeft niet in je collectie te staan.</small>
              </>
            )}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="box-condition">
              Staat van de doos
            </label>
            <textarea
              className="input"
              id="box-condition"
              rows={3}
              placeholder="Bijv. compleet, kaarten gesleeved, hoek van de doos ingedeukt"
              aria-invalid={!!errors.condition}
              aria-describedby={errors.condition ? 'box-condition-error' : undefined}
              {...register('condition')}
            />
            {errors.condition && (
              <div id="box-condition-error" className="field__error" role="alert">
                {errors.condition.message}
              </div>
            )}
          </div>
        </div>
        <div className="modal__footer">
          <button type="button" className="btn btn--outline-secondary" onClick={onClose}>
            Annuleren
          </button>
          <button className="btn btn--primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? submittingLabel : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  )
}
