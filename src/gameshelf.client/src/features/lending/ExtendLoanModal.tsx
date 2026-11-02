import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '../../components/Alert'
import Modal from '../../components/Modal'
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
    <Modal title="Lening verlengen" onClose={onClose}>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="modal__body">
          {extendLoan.isError && (
            <Alert variant="danger">{getErrorMessage(extendLoan.error)}</Alert>
          )}
          <p>
            {box ? `${box.game.title} moet` : 'De doos moet'} nu terug op{' '}
            {formatDate(loan.returnDate)}. Je kunt een lening maar één keer verlengen.
          </p>

          <div className="field">
            <label className="field__label" htmlFor="extend-loan-return-date">
              Nieuwe inleverdatum
            </label>
            <input
              className="input"
              id="extend-loan-return-date"
              type="date"
              min={bounds.earliest}
              max={bounds.latest}
              aria-invalid={!!errors.returnDate}
              aria-describedby={errors.returnDate ? 'extend-loan-return-date-error' : undefined}
              {...register('returnDate')}
            />
            {errors.returnDate && (
              <div id="extend-loan-return-date-error" className="field__error" role="alert">
                {errors.returnDate.message}
              </div>
            )}
            <small className="field__hint">
              Uiterlijk {formatDate(bounds.latest)}, {MAX_LOAN_DAYS} dagen na de start.
            </small>
          </div>
        </div>
        <div className="modal__footer">
          <button type="button" className="btn btn--outline-secondary" onClick={onClose}>
            Annuleren
          </button>
          <button className="btn btn--primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Bezig met verlengen…' : 'Verlengen'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
