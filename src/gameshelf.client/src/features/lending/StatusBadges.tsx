import { Badge } from 'react-bootstrap'
import type { LoanRequestStatus } from '../../types'

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
