import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Form, Modal } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { getErrorMessage } from '../../api/errors'
import type { Box, LoanRequest } from '../../types'
import { formatEdition } from '../../utils/format'
import { useStartLoan } from './api'
import {
  formatDate,
  MAX_LOAN_DAYS,
  returnDateSchema,
  startLoanBounds,
  suggestedReturnDate,
  type ReturnDateInput,
} from './lendingRules'

interface StartLoanModalProps {
  box: Box
  request: LoanRequest
  borrowerName?: string
  onClose: () => void
}

export default function StartLoanModal({
  box,
  request,
  borrowerName,
  onClose,
}: StartLoanModalProps) {
  const startLoan = useStartLoan()
  const bounds = startLoanBounds()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReturnDateInput>({
    resolver: zodResolver(returnDateSchema(bounds)),
    defaultValues: { returnDate: suggestedReturnDate() },
  })

  const onSubmit = async (values: ReturnDateInput) => {
    try {
      await startLoan.mutateAsync({ requestId: request.id, ...values })
      onClose()
    } catch {
      // De fout staat in de mutation en wordt hieronder getoond
    }
  }

  return (
    <Modal show onHide={onClose} aria-labelledby="start-loan-title">
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title id="start-loan-title">Lening starten</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {startLoan.isError && <Alert variant="danger">{getErrorMessage(startLoan.error)}</Alert>}
          <p>
            Start de lening als je {box.game.title} ({formatEdition(box.game)}) op de clubavond aan{' '}
            {borrowerName ?? '…'} geeft. De lening gaat vandaag in.
          </p>

          <Form.Group controlId="start-loan-return-date">
            <Form.Label>Inleverdatum</Form.Label>
            <Form.Control
              type="date"
              min={bounds.earliest}
              max={bounds.latest}
              isInvalid={!!errors.returnDate}
              {...register('returnDate')}
            />
            <Form.Control.Feedback type="invalid">
              {errors.returnDate?.message}
            </Form.Control.Feedback>
            <Form.Text>
              Uiterlijk {formatDate(bounds.latest)}, {MAX_LOAN_DAYS} dagen na vandaag.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose}>
            Annuleren
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Bezig met starten…' : 'Lening starten'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
