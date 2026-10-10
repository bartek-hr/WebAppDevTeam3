import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Form, Modal } from 'react-bootstrap'
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
    <Modal show onHide={onClose}>
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>{box ? 'Doos bewerken' : 'Doos aanbieden'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {mutation.isError && <Alert variant="danger">{getErrorMessage(mutation.error)}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label htmlFor="box-game">Game</Form.Label>
            {box ? (
              <Form.Control
                id="box-game"
                readOnly
                plaintext
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
                <Form.Text className="d-block">
                  De game hoeft niet in je collectie te staan.
                </Form.Text>
              </>
            )}
          </Form.Group>

          <Form.Group controlId="box-condition">
            <Form.Label>Staat van de doos</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Bijv. compleet, kaarten gesleeved, hoek van de doos ingedeukt"
              isInvalid={!!errors.condition}
              {...register('condition')}
            />
            <Form.Control.Feedback type="invalid">
              {errors.condition?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose}>
            Annuleren
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
