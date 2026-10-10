import { Alert, Button, Card, ListGroup } from 'react-bootstrap'
import { Check2, X } from 'react-bootstrap-icons'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import PageSpinner from '../../components/PageSpinner'
import type { Box, LoanRequest } from '../../types'
import { formatEdition } from '../../utils/format'
import { useMembers } from '../auth/api'
import { useAuth } from '../auth/useAuth'
import { useApproveRequest, useBoxes, useLoanRequests, useRejectRequest } from './api'
import { formatDate } from './lendingRules'
import { BoxAvailabilityBadge, RequestStatusBadge } from './StatusBadges'

interface IncomingRequestProps {
  request: LoanRequest
  userName?: string
}

// Een aanvraag op mijn doos; zolang hij in afwachting is kan ik hem goedkeuren of afwijzen
function IncomingRequest({ request, userName }: IncomingRequestProps) {
  const approve = useApproveRequest()
  const reject = useRejectRequest()
  const isBusy = approve.isPending || reject.isPending
  const error = approve.error ?? reject.error

  return (
    <ListGroup.Item as="li">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div>
          <div className="fw-semibold">{userName ?? '…'}</div>
          <div className="small text-body-secondary">
            Aangevraagd op {formatDate(request.createdOn)}
          </div>
        </div>
        <RequestStatusBadge status={request.status} />
      </div>
      {request.status === 'Pending' && (
        <div className="d-flex flex-wrap gap-2 mt-2">
          <Button
            size="sm"
            variant="success"
            disabled={isBusy}
            onClick={() => approve.mutate(request.id)}
          >
            <Check2 className="me-1" />
            {approve.isPending ? 'Bezig met goedkeuren…' : 'Goedkeuren'}
          </Button>
          <Button
            size="sm"
            variant="outline-danger"
            disabled={isBusy}
            onClick={() => reject.mutate(request.id)}
          >
            <X className="me-1" />
            {reject.isPending ? 'Bezig met afwijzen…' : 'Afwijzen'}
          </Button>
        </div>
      )}
      {error && (
        <Alert variant="danger" className="small p-2 mt-2 mb-0">
          {getErrorMessage(error)}
        </Alert>
      )}
    </ListGroup.Item>
  )
}

interface BoxRequestsCardProps {
  box: Box
  requests: LoanRequest[]
  userNames: Map<string, string>
}

function BoxRequestsCard({ box, requests, userNames }: BoxRequestsCardProps) {
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Header className="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div>
          <h2 className="h6 mb-0">
            <Link to={`/catalogue/${box.game.id}`}>{box.game.title}</Link>
          </h2>
          <div className="small text-body-secondary">{formatEdition(box.game)}</div>
        </div>
        <BoxAvailabilityBadge isOnLoan={box.isOnLoan} />
      </Card.Header>
      {requests.length === 0 ? (
        <Card.Body className="small text-body-secondary">Nog geen aanvragen</Card.Body>
      ) : (
        <ListGroup as="ul" variant="flush">
          {requests.map((request) => (
            <IncomingRequest
              key={request.id}
              request={request}
              userName={userNames.get(request.requesterId)}
            />
          ))}
        </ListGroup>
      )}
    </Card>
  )
}

export default function MyBoxesTab() {
  const { member } = useAuth()
  const boxes = useBoxes()
  const loanRequests = useLoanRequests()
  const { data: members } = useMembers()

  if (boxes.isLoading || loanRequests.isLoading) return <PageSpinner />
  if (boxes.isError || loanRequests.isError) {
    return (
      <Alert variant="danger">
        Je dozen konden niet geladen worden. {getErrorMessage(boxes.error ?? loanRequests.error)}
      </Alert>
    )
  }

  const userNames = new Map(members?.map((m) => [m.id, m.userName]))
  const myBoxes = (boxes.data ?? [])
    .filter((box) => box.ownerId === member?.id)
    .sort((a, b) => a.game.title.localeCompare(b.game.title, 'nl') || a.id - b.id)

  if (myBoxes.length === 0) {
    return (
      <Alert variant="light" className="border">
        Je biedt nog geen dozen aan. <Link to="/lending">Naar de uitleenlijst</Link>
      </Alert>
    )
  }

  // Per doos de oudste aanvraag eerst, in volgorde van binnenkomst
  const requestsFor = (boxId: number) =>
    (loanRequests.data ?? [])
      .filter((r) => r.boxId === boxId)
      .sort((a, b) => a.createdOn.localeCompare(b.createdOn) || a.id - b.id)

  return (
    <>
      {myBoxes.map((box) => (
        <BoxRequestsCard
          key={box.id}
          box={box}
          requests={requestsFor(box.id)}
          userNames={userNames}
        />
      ))}
    </>
  )
}
