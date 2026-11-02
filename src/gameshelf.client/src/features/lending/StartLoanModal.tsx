import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '../../components/Alert'
import Modal from '../../components/Modal'
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
    <Modal title="Lening starten" onClose={onClose}>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="modal__body">
          {startLoan.isError && <Alert variant="danger">{getErrorMessage(startLoan.error)}</Alert>}
          <p>
            Start de lening als je {box.game.title} ({formatEdition(box.game)}) op de clubavond aan{' '}
            {borrowerName ?? '…'} geeft. De lening gaat vandaag in.
          </p>

          <div className="field">
            <label className="field__label" htmlFor="start-loan-return-date">
              Inleverdatum
            </label>
            <input
              className="input"
              id="start-loan-return-date"
              type="date"
              min={bounds.earliest}
              max={bounds.latest}
              aria-invalid={!!errors.returnDate}
              aria-describedby={errors.returnDate ? 'start-loan-return-date-error' : undefined}
              {...register('returnDate')}
            />
            {errors.returnDate && (
              <div id="start-loan-return-date-error" className="field__error" role="alert">
                {errors.returnDate.message}
              </div>
            )}
            <small className="field__hint">
              Uiterlijk {formatDate(bounds.latest)}, {MAX_LOAN_DAYS} dagen na vandaag.
            </small>
          </div>
        </div>
        <div className="modal__footer">
          <button type="button" className="btn btn--outline-secondary" onClick={onClose}>
            Annuleren
          </button>
          <button className="btn btn--primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Bezig met starten…' : 'Lening starten'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
