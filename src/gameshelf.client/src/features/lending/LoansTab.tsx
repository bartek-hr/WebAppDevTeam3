import { useState } from 'react'
import { Alert, Button, ListGroup } from 'react-bootstrap'
import { CalendarPlus } from 'react-bootstrap-icons'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import PageSpinner from '../../components/PageSpinner'
import type { Box, Loan } from '../../types'
import { useMembers } from '../auth/api'
import { useAuth } from '../auth/useAuth'
import { useBoxes, useLoans } from './api'
import ExtendLoanModal from './ExtendLoanModal'
import { formatDate, getExtendBlockReason } from './lendingRules'
import LoanDueText from './LoanDueText'
import ReturnLoanButton from './ReturnLoanButton'
import { LoanStatusBadge } from './StatusBadges'

interface ExtendLoanButtonProps {
  loan: Loan
  box?: Box
}

// Verlengen kan één keer en niet als je al te laat bent; anders staat de reden onder de knop
function ExtendLoanButton({ loan, box }: ExtendLoanButtonProps) {
  const [isExtending, setIsExtending] = useState(false)
  const blockReason = getExtendBlockReason(loan)

  return (
    <>
      <Button
        size="sm"
        variant="outline-primary"
        className="mt-2"
        disabled={!!blockReason}
        onClick={() => setIsExtending(true)}
      >
        <CalendarPlus className="me-1" />
        Verlengen
      </Button>
      {blockReason && <div className="small text-body-secondary mt-1">{blockReason}</div>}

      {isExtending && (
        <ExtendLoanModal loan={loan} box={box} onClose={() => setIsExtending(false)} />
      )}
    </>
  )
}

interface LoanItemProps {
  loan: Loan
  box?: Box
  isLender: boolean
  otherName?: string
}

function LoanItem({ loan, box, isLender, otherName }: LoanItemProps) {
  return (
    <ListGroup.Item as="li">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div>
          {box ? (
            <Link to={`/catalogue/${box.game.id}`} className="fw-semibold">
              {box.game.title}
            </Link>
          ) : (
            <span className="fw-semibold">Doos niet meer op de uitleenlijst</span>
          )}
          <div className="small">
            {isLender ? 'Geleend door' : 'Eigenaar'}: {otherName ?? '…'}
          </div>
          <div className="small text-body-secondary">
            Van {formatDate(loan.startDate)} tot {formatDate(loan.returnDate)}
          </div>
          <LoanDueText loan={loan} />
        </div>
        <LoanStatusBadge loan={loan} />
      </div>
      {!isLender && !loan.returnedOn && <ExtendLoanButton loan={loan} box={box} />}
      {isLender && !loan.returnedOn && (
        <ReturnLoanButton loan={loan} box={box} borrowerName={otherName} />
      )}
    </ListGroup.Item>
  )
}

// Lopende leningen eerst met te laat bovenaan, de teruggebrachte daarna
const byUrgency = (a: Loan, b: Loan) =>
  Number(!!a.returnedOn) - Number(!!b.returnedOn) ||
  Number(b.isLate) - Number(a.isLate) ||
  a.returnDate.localeCompare(b.returnDate) ||
  a.id - b.id

interface LoanSectionProps {
  id: string
  title: string
  emptyText: string
  loans: Loan[]
  isLender: boolean
  boxesById: Map<number, Box>
  userNames: Map<string, string>
}

function LoanSection({
  id,
  title,
  emptyText,
  loans,
  isLender,
  boxesById,
  userNames,
}: LoanSectionProps) {
  return (
    <section className="mb-4" aria-labelledby={id}>
      <h2 className="h5" id={id}>
        {title}
      </h2>
      {loans.length === 0 ? (
        <Alert variant="light" className="border">
          {emptyText}
        </Alert>
      ) : (
        <ListGroup as="ul">
          {loans.map((loan) => {
            const box = boxesById.get(loan.boxId)
            const otherId = isLender ? loan.borrowerId : box?.ownerId
            return (
              <LoanItem
                key={loan.id}
                loan={loan}
                box={box}
                isLender={isLender}
                otherName={otherId && userNames.get(otherId)}
              />
            )
          })}
        </ListGroup>
      )}
    </section>
  )
}

export default function LoansTab() {
  const { member } = useAuth()
  const boxes = useBoxes()
  const loans = useLoans()
  const { data: members } = useMembers()

  if (boxes.isLoading || loans.isLoading) return <PageSpinner />
  if (boxes.isError || loans.isError) {
    return (
      <Alert variant="danger">
        Je leningen konden niet geladen worden. {getErrorMessage(boxes.error ?? loans.error)}
      </Alert>
    )
  }

  const userNames = new Map(members?.map((m) => [m.id, m.userName]))
  const boxesById = new Map(boxes.data?.map((box) => [box.id, box]))
  const sortedLoans = [...(loans.data ?? [])].sort(byUrgency)
  const lent = sortedLoans.filter((loan) => boxesById.get(loan.boxId)?.ownerId === member?.id)
  const borrowed = sortedLoans.filter((loan) => loan.borrowerId === member?.id)

  return (
    <>
      <LoanSection
        id="loans-lent"
        title="Uitgeleend"
        emptyText="Je hebt nog geen dozen uitgeleend."
        loans={lent}
        isLender
        boxesById={boxesById}
        userNames={userNames}
      />
      <LoanSection
        id="loans-borrowed"
        title="Geleend"
        emptyText="Je hebt nog geen dozen geleend."
        loans={borrowed}
        isLender={false}
        boxesById={boxesById}
        userNames={userNames}
      />
    </>
  )
}
