import { Alert, ListGroup } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import PageSpinner from '../../components/PageSpinner'
import type { Box, Loan } from '../../types'
import { useMembers } from '../auth/api'
import { useActiveLoans, useBoxes } from './api'
import { formatDate } from './lendingRules'
import LoanDueText from './LoanDueText'
import ReturnLoanButton from './ReturnLoanButton'
import { LoanStatusBadge } from './StatusBadges'

interface CommitteeLoanItemProps {
  loan: Loan
  box?: Box
  ownerName?: string
  borrowerName?: string
}

function CommitteeLoanItem({ loan, box, ownerName, borrowerName }: CommitteeLoanItemProps) {
  return (
    <ListGroup.Item as="li" variant={loan.isLate ? 'danger' : undefined}>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div>
          {box ? (
            <Link to={`/catalogue/${box.game.id}`} className="fw-semibold">
              {box.game.title}
            </Link>
          ) : (
            <span className="fw-semibold">Doos niet meer op de uitleenlijst</span>
          )}
          <div className="small">Eigenaar: {ownerName ?? '…'}</div>
          <div className="small">Geleend door: {borrowerName ?? '…'}</div>
          <div className="small text-body-secondary">
            Van {formatDate(loan.startDate)} tot {formatDate(loan.returnDate)}
          </div>
          <LoanDueText loan={loan} />
        </div>
        <LoanStatusBadge loan={loan} />
      </div>
      <ReturnLoanButton loan={loan} box={box} borrowerName={borrowerName} label="Terug ontvangen" />
    </ListGroup.Item>
  )
}

export default function CommitteeLoansTab() {
  const boxes = useBoxes()
  const loans = useActiveLoans()
  const { data: members } = useMembers()

  if (boxes.isLoading || loans.isLoading) return <PageSpinner />
  if (boxes.isError || loans.isError) {
    return (
      <Alert variant="danger">
        De lopende leningen konden niet geladen worden.{' '}
        {getErrorMessage(boxes.error ?? loans.error)}
      </Alert>
    )
  }

  const userNames = new Map(members?.map((m) => [m.id, m.userName]))
  const boxesById = new Map(boxes.data?.map((box) => [box.id, box]))

  // De API levert de te late leningen al bovenaan
  return (
    <>
      <p className="small text-body-secondary">
        Is de eigenaar er niet op de clubavond, dan neemt het bestuur de doos in ontvangst. Te late
        leningen staan bovenaan.
      </p>
      {loans.data?.length ? (
        <ListGroup as="ul">
          {loans.data.map((loan) => {
            const box = boxesById.get(loan.boxId)
            return (
              <CommitteeLoanItem
                key={loan.id}
                loan={loan}
                box={box}
                ownerName={box && userNames.get(box.ownerId)}
                borrowerName={userNames.get(loan.borrowerId)}
              />
            )
          })}
        </ListGroup>
      ) : (
        <Alert variant="light" className="border">
          Er zijn geen lopende leningen.
        </Alert>
      )}
    </>
  )
}
