import { addDays } from 'date-fns'
import type { HttpHandler } from 'msw'
import type { Box, Loan, LoanRequest, LoanRequestStatus } from '../../types'
import { games } from '../catalogue/mocks'
import { toDateString } from './lendingRules'

// Eigenaar: Rayell. Nep-endpoints voor deze feature (alleen actief als VITE_USE_MOCKS=true).

// Opgeslagen zonder afgeleide velden, die rekent de mock per response uit
type BoxRecord = Omit<Box, 'isOnLoan'>
type LoanRecord = Omit<Loan, 'isLate'> & { requestId: number }

const daysFromToday = (days: number) => toDateString(addDays(new Date(), days))

const box = (id: number, ownerId: string, gameId: number, condition: string): BoxRecord => ({
  id,
  ownerId,
  game: games.find((game) => game.id === gameId)!,
  condition,
})

const request = (
  id: number,
  boxId: number,
  requesterId: string,
  status: LoanRequestStatus,
  createdOn: string,
): LoanRequest => ({ id, boxId, requesterId, status, createdOn })

// Leden en games via de id's uit auth/mocks en catalogue/mocks
const seedBoxes = (): BoxRecord[] => [
  box(1, 'm4', 6, 'Kaarten gesleeved, één stickervel mist'),
  box(2, 'm2', 1, 'Compleet, doos iets ingedeukt'),
  box(3, 'm3', 2, 'Tien jaar oud, alles zit erin, hoeken met tape gerepareerd'),
  box(4, 'm1', 9, 'Als nieuw'),
  box(5, 'm5', 4, 'Prima staat'),
  box(6, 'm6', 15, 'Eén tegel vervangen door een knoop'),
  box(7, 'm2', 13, 'Compleet'),
  box(8, 'm4', 17, 'Grote doos, kaarten gesleeved'),
]

const seedLoanRequests = (): LoanRequest[] => [
  request(1, 1, 'm6', 'Approved', '2019-03-01'),
  request(2, 2, 'm3', 'Pending', daysFromToday(-3)),
  request(3, 2, 'm4', 'Pending', daysFromToday(-2)),
  request(4, 2, 'm6', 'Pending', daysFromToday(-1)),
  request(5, 3, 'm2', 'Approved', daysFromToday(-12)),
  request(6, 4, 'm3', 'Approved', daysFromToday(-22)),
  request(7, 6, 'm5', 'Approved', daysFromToday(-32)),
  request(8, 7, 'm4', 'Approved', daysFromToday(-62)),
  request(9, 8, 'm2', 'Rejected', daysFromToday(-6)),
  request(10, 8, 'm1', 'Approved', daysFromToday(-4)),
]

const seedLoans = (): LoanRecord[] => [
  // De doos bij de neef: vaste datums, blijft altijd te laat
  {
    id: 1,
    boxId: 1,
    borrowerId: 'm6',
    startDate: '2019-03-07',
    returnDate: '2019-04-04',
    isExtended: false,
    requestId: 1,
  },
  {
    id: 2,
    boxId: 3,
    borrowerId: 'm2',
    startDate: daysFromToday(-10),
    returnDate: daysFromToday(4),
    isExtended: false,
    requestId: 5,
  },
  {
    id: 3,
    boxId: 4,
    borrowerId: 'm3',
    startDate: daysFromToday(-20),
    returnDate: daysFromToday(5),
    isExtended: true,
    requestId: 6,
  },
  {
    id: 4,
    boxId: 6,
    borrowerId: 'm5',
    startDate: daysFromToday(-30),
    returnDate: daysFromToday(-2),
    isExtended: false,
    requestId: 7,
  },
  {
    id: 5,
    boxId: 7,
    borrowerId: 'm4',
    startDate: daysFromToday(-60),
    returnDate: daysFromToday(-35),
    isExtended: false,
    returnedOn: daysFromToday(-36),
    requestId: 8,
  },
]

// Nep-data voor de uitleenlijst, andere features mogen de id's hergebruiken
export const boxes = seedBoxes()
export const loanRequests = seedLoanRequests()
export const loans = seedLoans()

// Zet de nep-data terug naar de beginstand (voor tests); de arrays zelf blijven dezelfde
export function resetLendingMocks() {
  boxes.splice(0, boxes.length, ...seedBoxes())
  loanRequests.splice(0, loanRequests.length, ...seedLoanRequests())
  loans.splice(0, loans.length, ...seedLoans())
}

export const lendingHandlers: HttpHandler[] = []
