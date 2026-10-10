import { Button, Modal } from 'react-bootstrap'
import type { WishlistItem } from '../../types'
import { formatEdition } from '../../utils/format'
import { useMember } from '../auth/api'

interface MakeOfferModalProps {
  wishlistItem: WishlistItem
  onClose: () => void
}

export default function MakeOfferModal({ wishlistItem, onClose }: MakeOfferModalProps) {
  const { data: owner } = useMember(wishlistItem.ownerId)
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
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>
          Sluiten
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
