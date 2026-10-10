import { Alert, Button, Modal } from 'react-bootstrap'
import { getErrorMessage } from '../../api/errors'
import type { Box, Loan } from '../../types'
import { useReturnLoan } from './api'

interface ReturnLoanModalProps {
  loan: Loan
  box?: Box
  borrowerName?: string
  onClose: () => void
}

export default function ReturnLoanModal({
  loan,
  box,
  borrowerName,
  onClose,
}: ReturnLoanModalProps) {
  const returnLoan = useReturnLoan()

  return (
    <Modal show onHide={onClose} aria-labelledby="return-loan-title">
      <Modal.Header closeButton>
        <Modal.Title id="return-loan-title">Doos teruggebracht</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {returnLoan.isError && <Alert variant="danger">{getErrorMessage(returnLoan.error)}</Alert>}
        <p className="mb-0">
          Heeft {borrowerName ?? '…'} {box?.game.title ?? 'de doos'} teruggebracht? Daarna is de
          doos weer beschikbaar op de uitleenlijst.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>
          Annuleren
        </Button>
        <Button
          variant="success"
          disabled={returnLoan.isPending}
          onClick={() => returnLoan.mutate(loan.id, { onSuccess: onClose })}
        >
          {returnLoan.isPending ? 'Bezig met registreren…' : 'Teruggebracht'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
