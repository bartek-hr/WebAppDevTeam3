import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { BoxArrowInLeft } from 'react-bootstrap-icons'
import type { Box, Loan } from '../../types'
import ReturnLoanModal from './ReturnLoanModal'

interface ReturnLoanButtonProps {
  loan: Loan
  box?: Box
  borrowerName?: string
}

export default function ReturnLoanButton({ loan, box, borrowerName }: ReturnLoanButtonProps) {
  const [isReturning, setIsReturning] = useState(false)

  return (
    <>
      <Button
        size="sm"
        variant="outline-success"
        className="mt-2"
        onClick={() => setIsReturning(true)}
      >
        <BoxArrowInLeft className="me-1" />
        Teruggebracht
      </Button>

      {isReturning && (
        <ReturnLoanModal
          loan={loan}
          box={box}
          borrowerName={borrowerName}
          onClose={() => setIsReturning(false)}
        />
      )}
    </>
  )
}
