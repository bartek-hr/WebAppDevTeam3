import '../lending/lending.css'
import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '../../components/Alert'
import Modal from '../../components/Modal'
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
        <p className="text-small text-muted">
          Gezocht door <strong>{owner.userName}</strong>
        </p>
      )}
      <h2 className="lending-title">{game.title}</h2>
      <div className="text-small text-muted">{formatEdition(game)}</div>
      {note && <p className="text-small lending-space-top">Opmerking: {note}</p>}
    </>
  )

  return (
    <Modal title="Bod doen" onClose={onClose}>
      {blockReason ? (
        <>
          <div className="modal__body">
            {wantedGame}
            <Alert variant="info" className="lending-space-top">
              {blockReason}
            </Alert>
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--outline-secondary" onClick={onClose}>
              Sluiten
            </button>
          </div>
        </>
      ) : (
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="modal__body">
            {wantedGame}
            {createOffer.isError && (
              <Alert variant="danger" className="lending-space-top">
                {getErrorMessage(createOffer.error)}
              </Alert>
            )}
            <div className="field">
              <label className="field__label" htmlFor="askedGameId">
                Welke game vraag je terug?
              </label>
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
            </div>
            <p className="text-small text-muted lending-space-top">
              Je ruilt altijd game tegen game, zonder geld.
            </p>
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--outline-secondary" onClick={onClose}>
              Annuleren
            </button>
            <button className="btn btn--primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Bezig met versturen…' : 'Bod doen'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
