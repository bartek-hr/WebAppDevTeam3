import type { Loan } from '../../types'
import { daysUntilReturn, formatDate, lateSince } from './lendingRules'

interface LoanDueTextProps {
  loan: Loan
}

export default function LoanDueText({ loan }: LoanDueTextProps) {
  if (loan.returnedOn) {
    return (
      <div className="small text-body-secondary">
        Teruggebracht op {formatDate(loan.returnedOn)}
      </div>
    )
  }
  if (loan.isLate) {
    return (
      <div className="small text-danger">
        Te laat sinds {formatDate(lateSince(loan.returnDate))}
      </div>
    )
  }
  const days = daysUntilReturn(loan.returnDate)
  return (
    <div className="small">
      {days === 0 ? 'Vandaag inleveren' : `Nog ${days} ${days === 1 ? 'dag' : 'dagen'}`}
    </div>
  )
}
