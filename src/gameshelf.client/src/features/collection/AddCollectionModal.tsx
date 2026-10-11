import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Form, Modal } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { getErrorMessage } from '../../api/errors'
import GamePicker from '../../components/GamePicker'
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
    <Modal show onHide={onClose} aria-labelledby="add-collection-title">
      <Modal.Header closeButton>
        <Modal.Title id="add-collection-title">Game toevoegen</Modal.Title>
      </Modal.Header>
      <Form
        onSubmit={handleSubmit(async ({ gameId }) => {
          try {
            await add.mutateAsync(gameId)
            onClose()
          } catch {
            /* Fout hieronder */
          }
        })}
      >
        <Modal.Body>
          {add.isError && <Alert variant="danger">{getErrorMessage(add.error)}</Alert>}
          <Form.Label htmlFor="collection-game">Game</Form.Label>
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={add.isPending}>
            Annuleren
          </Button>
          <Button type="submit" disabled={add.isPending}>
            Toevoegen
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
