import Alert from '../../components/Alert'
import Modal from '../../components/Modal'
import { getErrorMessage } from '../../api/errors'
import type { Box, Loan } from '../../types'
import { useReturnLoan } from './api'

interface ReturnLoanModalProps {
  loan: Loan
  box?: Box
  borrowerName?: string
  confirmLabel?: string
  onClose: () => void
}

export default function ReturnLoanModal({
  loan,
  box,
  borrowerName,
  confirmLabel = 'Teruggebracht',
  onClose,
}: ReturnLoanModalProps) {
  const returnLoan = useReturnLoan()

  return (
    <Modal title="Doos teruggebracht" onClose={onClose}>
      <div className="modal__body">
        {returnLoan.isError && <Alert variant="danger">{getErrorMessage(returnLoan.error)}</Alert>}
        <p className="lending-no-margin">
          Heeft {borrowerName ?? '…'} {box?.game.title ?? 'de doos'} teruggebracht? Daarna is de
          doos weer beschikbaar op de uitleenlijst.
        </p>
      </div>
      <div className="modal__footer">
        <button type="button" className="btn btn--outline-secondary" onClick={onClose}>
          Annuleren
        </button>
        <button
          type="button"
          className="btn btn--success"

          disabled={returnLoan.isPending}
          onClick={() => returnLoan.mutate(loan.id, { onSuccess: onClose })}
        >
          {returnLoan.isPending ? 'Bezig met registreren…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
