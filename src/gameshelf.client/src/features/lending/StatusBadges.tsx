import { Badge } from 'react-bootstrap'

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
