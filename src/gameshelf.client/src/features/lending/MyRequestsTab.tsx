import Alert from '../../components/Alert'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import PageSpinner from '../../components/PageSpinner'
import { useMembers } from '../auth/api'
import { useAuth } from '../auth/useAuth'
import { useBoxes, useLoanRequests } from './api'
import { formatDate } from './lendingRules'
import { RequestStatusBadge } from './StatusBadges'

export default function MyRequestsTab() {
  const { member } = useAuth()
  const boxes = useBoxes()
  const loanRequests = useLoanRequests()
  const { data: members } = useMembers()

  if (boxes.isLoading || loanRequests.isLoading) return <PageSpinner />
  if (boxes.isError || loanRequests.isError) {
    return (
      <Alert variant="danger">
        Je aanvragen konden niet geladen worden.{' '}
        {getErrorMessage(boxes.error ?? loanRequests.error)}
      </Alert>
    )
  }

  const userNames = new Map(members?.map((m) => [m.id, m.userName]))
  const boxesById = new Map(boxes.data?.map((box) => [box.id, box]))
  const myRequests = (loanRequests.data ?? [])
    .filter((r) => r.requesterId === member?.id)
    .sort((a, b) => b.createdOn.localeCompare(a.createdOn) || b.id - a.id)

  if (myRequests.length === 0) {
    return (
      <Alert variant="neutral">
        Je hebt nog geen dozen aangevraagd. <Link to="/lending">Naar de uitleenlijst</Link>
      </Alert>
    )
  }

  return (
    <ul className="lending-list">
      {myRequests.map((request) => {
        // Een doos die van de lijst is gehaald staat niet meer in de uitleenlijst
        const box = boxesById.get(request.boxId)
        return (
          <li key={request.id} className="lending-list__item lending-row">
            <div>
              {box ? (
                <Link to={`/catalogue/${box.game.id}`} className="lending-strong">
                  {box.game.title}
                </Link>
              ) : (
                <span className="lending-strong">Doos niet meer op de uitleenlijst</span>
              )}
              {box && (
                <div className="text-small">Eigenaar: {userNames.get(box.ownerId) ?? '…'}</div>
              )}
              <div className="text-small text-muted">
                Aangevraagd op {formatDate(request.createdOn)}
              </div>
            </div>
            <RequestStatusBadge status={request.status} />
          </li>
        )
      })}
    </ul>
  )
}
