import { Alert, Button, Modal } from 'react-bootstrap'
import type { WishlistItem } from '../../types'
import { formatEdition } from '../../utils/format'
import { useMember } from '../auth/api'
import { useAuth } from '../auth/useAuth'

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
  const blockReason = getBlockReason(wishlistItem, member?.id)
  const { game, note } = wishlistItem

  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Bod doen</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {owner && (
          <p className="small text-body-secondary mb-1">
            Gezocht door <strong>{owner.userName}</strong>
          </p>
        )}
        <h2 className="h5 mb-0">{game.title}</h2>
        <div className="small text-body-secondary">{formatEdition(game)}</div>
        {note && <p className="small mt-2 mb-0">Opmerking: {note}</p>}
        {blockReason && (
          <Alert variant="info" className="mt-3 mb-0">
            {blockReason}
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>
          Sluiten
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
