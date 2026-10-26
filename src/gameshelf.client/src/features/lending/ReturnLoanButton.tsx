import { useState } from 'react'
import { ReturnIcon } from '../../components/icons'
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
      <button
        type="button"
        className="btn btn--outline-success btn--sm lending-space-top"

        onClick={() => setIsReturning(true)}
      >
        <ReturnIcon />
        {label}
      </button>

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
