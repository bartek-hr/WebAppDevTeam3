import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Form, Modal } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { getErrorMessage } from '../../api/errors'
import GamePicker from '../../components/GamePicker'
import type { WishlistItem } from '../../types'
import { formatEdition } from '../../utils/format'
import { useMember } from '../auth/api'
import { useAuth } from '../auth/useAuth'
import { useCreateOffer } from './api'
import { offerSchema, type NewOffer } from './tradingRules'

interface MakeOfferModalProps {
  wishlistItem: WishlistItem
  onClose: () => void
}

// Waarom je op dit item geen bod kunt doen, of null als het wel kan
function getBlockReason(wishlistItem: WishlistItem, memberId?: string) {
  if (wishlistItem.ownerId === memberId) return 'Dit is je eigen verlanglijst-item.'
  if (wishlistItem.isFulfilled) return 'Dit item is al vervuld en neemt geen biedingen meer aan.'
  return null
}

export default function MakeOfferModal({ wishlistItem, onClose }: MakeOfferModalProps) {
  const { member } = useAuth()
  const { data: owner } = useMember(wishlistItem.ownerId)
  const createOffer = useCreateOffer()
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<NewOffer>({ resolver: zodResolver(offerSchema) })
  const blockReason = getBlockReason(wishlistItem, member?.id)
  const { game, note } = wishlistItem

  const onSubmit = async ({ askedGameId }: NewOffer) => {
    try {
      await createOffer.mutateAsync({ wishlistItemId: wishlistItem.id, askedGameId })
      onClose()
    } catch {
      // De fout staat in createOffer.error en wordt hieronder getoond
    }
  }

  const wantedGame = (
    <>
      {owner && (
        <p className="small text-body-secondary mb-1">
          Gezocht door <strong>{owner.userName}</strong>
        </p>
      )}
      <h2 className="h5 mb-0">{game.title}</h2>
      <div className="small text-body-secondary">{formatEdition(game)}</div>
      {note && <p className="small mt-2 mb-0">Opmerking: {note}</p>}
    </>
  )

  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Bod doen</Modal.Title>
      </Modal.Header>
      {blockReason ? (
        <>
          <Modal.Body>
            {wantedGame}
            <Alert variant="info" className="mt-3 mb-0">
              {blockReason}
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={onClose}>
              Sluiten
            </Button>
          </Modal.Footer>
        </>
      ) : (
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            {wantedGame}
            {createOffer.isError && (
              <Alert variant="danger" className="mt-3">
                {getErrorMessage(createOffer.error)}
              </Alert>
            )}
            <Form.Group className="mt-3">
              <Form.Label htmlFor="askedGameId">Welke game vraag je terug?</Form.Label>
              <Controller
                name="askedGameId"
                control={control}
                render={({ field, fieldState }) => (
                  <GamePicker
                    id="askedGameId"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    excludeIds={[game.id]}
                    error={fieldState.error?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Form.Group>
            <p className="small text-body-secondary mt-3 mb-0">
              Je ruilt altijd game tegen game, zonder geld.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={onClose}>
              Annuleren
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Bezig met versturen…' : 'Bod doen'}
            </Button>
          </Modal.Footer>
        </Form>
      )}
    </Modal>
  )
}
