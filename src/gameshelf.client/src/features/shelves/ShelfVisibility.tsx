import { Badge } from 'react-bootstrap'
import { Globe, Lock } from 'react-bootstrap-icons'

export default function ShelfVisibility({ isPublic }: { isPublic: boolean }) {
  return isPublic ? (
    <Badge bg="success-subtle" text="success-emphasis">
      <Globe className="me-1" aria-hidden />
      Openbaar
    </Badge>
  ) : (
    <Badge bg="secondary-subtle" text="secondary-emphasis">
      <Lock className="me-1" aria-hidden />
      Privé
    </Badge>
  )
}
