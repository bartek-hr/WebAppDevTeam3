import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Form, Modal } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { getErrorMessage } from '../../api/errors'
import type { Box, Loan } from '../../types'
import { useExtendLoan } from './api'
import {
  extendLoanBounds,
  formatDate,
  MAX_LOAN_DAYS,
  returnDateSchema,
  type ReturnDateInput,
} from './lendingRules'

interface ExtendLoanModalProps {
  loan: Loan
  box?: Box
  onClose: () => void
}

export default function ExtendLoanModal({ loan, box, onClose }: ExtendLoanModalProps) {
  const extendLoan = useExtendLoan()
  const bounds = extendLoanBounds(loan)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReturnDateInput>({
    resolver: zodResolver(returnDateSchema(bounds)),
    defaultValues: { returnDate: bounds.latest },
  })

  const onSubmit = async (values: ReturnDateInput) => {
    try {
      await extendLoan.mutateAsync({ id: loan.id, ...values })
      onClose()
    } catch {
      // De fout staat in de mutation en wordt hieronder getoond
    }
  }

  return (
    <Modal show onHide={onClose} aria-labelledby="extend-loan-title">
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title id="extend-loan-title">Lening verlengen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {extendLoan.isError && (
            <Alert variant="danger">{getErrorMessage(extendLoan.error)}</Alert>
          )}
          <p>
            {box ? `${box.game.title} moet` : 'De doos moet'} nu terug op{' '}
            {formatDate(loan.returnDate)}. Je kunt een lening maar één keer verlengen.
          </p>

          <Form.Group controlId="extend-loan-return-date">
            <Form.Label>Nieuwe inleverdatum</Form.Label>
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
              Uiterlijk {formatDate(bounds.latest)}, {MAX_LOAN_DAYS} dagen na de start.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose}>
            Annuleren
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Bezig met verlengen…' : 'Verlengen'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
