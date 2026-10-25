import { Badge } from 'react-bootstrap'
import type { Loan, LoanRequestStatus } from '../../types'

interface BoxAvailabilityBadgeProps {
  isOnLoan: boolean
}

export function BoxAvailabilityBadge({ isOnLoan }: BoxAvailabilityBadgeProps) {
  return isOnLoan ? (
    <Badge bg="secondary-subtle" text="secondary-emphasis">
      uitgeleend
    </Badge>
  ) : (
    <Badge bg="success-subtle" text="success-emphasis">
      beschikbaar
    </Badge>
  )
}

const requestStatuses = {
  Pending: { label: 'in afwachting', bg: 'warning-subtle', text: 'warning-emphasis' },
  Approved: { label: 'goedgekeurd', bg: 'success-subtle', text: 'success-emphasis' },
  Rejected: { label: 'afgewezen', bg: 'danger-subtle', text: 'danger-emphasis' },
} as const

interface RequestStatusBadgeProps {
  status: LoanRequestStatus
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  const { label, bg, text } = requestStatuses[status]
  return (
    <Badge bg={bg} text={text}>
      {label}
    </Badge>
  )
}

const loanStatuses = {
  returned: { label: 'teruggebracht', bg: 'secondary-subtle', text: 'secondary-emphasis' },
  late: { label: 'te laat', bg: 'danger-subtle', text: 'danger-emphasis' },
  onLoan: { label: 'uitgeleend', bg: 'primary-subtle', text: 'primary-emphasis' },
} as const

const loanStatus = (loan: Loan) => {
  if (loan.returnedOn) return 'returned'
  return loan.isLate ? 'late' : 'onLoan'
}

interface LoanStatusBadgeProps {
  loan: Loan
}

export function LoanStatusBadge({ loan }: LoanStatusBadgeProps) {
  const { label, bg, text } = loanStatuses[loanStatus(loan)]
  return (
    <span className="d-inline-flex flex-wrap gap-1">
      <Badge bg={bg} text={text}>
        {label}
      </Badge>
      {loan.isExtended && (
        <Badge bg="info-subtle" text="info-emphasis">
          verlengd
        </Badge>
      )}
    </span>
  )
}
