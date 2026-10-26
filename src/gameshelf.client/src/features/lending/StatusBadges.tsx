import type { Loan, LoanRequestStatus } from '../../types'

interface BoxAvailabilityBadgeProps {
  isOnLoan: boolean
}

export function BoxAvailabilityBadge({ isOnLoan }: BoxAvailabilityBadgeProps) {
  return isOnLoan ? (
    <span className="badge badge--secondary">uitgeleend</span>
  ) : (
    <span className="badge badge--success">beschikbaar</span>
  )
}

const requestStatuses = {
  Pending: { label: 'in afwachting', variant: 'warning' },
  Approved: { label: 'goedgekeurd', variant: 'success' },
  Rejected: { label: 'afgewezen', variant: 'danger' },
} as const

interface RequestStatusBadgeProps {
  status: LoanRequestStatus
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  const { label, variant } = requestStatuses[status]
  return <span className={`badge badge--${variant}`}>{label}</span>
}

const loanStatuses = {
  returned: { label: 'teruggebracht', variant: 'secondary' },
  late: { label: 'te laat', variant: 'danger' },
  onLoan: { label: 'uitgeleend', variant: 'primary' },
} as const

const loanStatus = (loan: Loan) => {
  if (loan.returnedOn) return 'returned'
  return loan.isLate ? 'late' : 'onLoan'
}

interface LoanStatusBadgeProps {
  loan: Loan
}

export function LoanStatusBadge({ loan }: LoanStatusBadgeProps) {
  const { label, variant } = loanStatuses[loanStatus(loan)]
  return (
    <span className="cluster">
      <span className={`badge badge--${variant}`}>{label}</span>
      {loan.isExtended && <span className="badge badge--primary">verlengd</span>}
    </span>
  )
}
