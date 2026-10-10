import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { BoxArrowInLeft } from 'react-bootstrap-icons'
import type { Box, Loan } from '../../types'
import ReturnLoanModal from './ReturnLoanModal'

interface ReturnLoanButtonProps {
  loan: Loan
  box?: Box
  borrowerName?: string
  // Het bestuur ontvangt de doos namens de eigenaar
  label?: string
}

export default function ReturnLoanButton({
  loan,
  box,
  borrowerName,
  label = 'Teruggebracht',
}: ReturnLoanButtonProps) {
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
        {label}
      </Button>

      {isReturning && (
        <ReturnLoanModal
          loan={loan}
          box={box}
          borrowerName={borrowerName}
          confirmLabel={label}
          onClose={() => setIsReturning(false)}
        />
      )}
    </>
  )
}
