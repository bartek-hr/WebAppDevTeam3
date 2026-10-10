import { addDays } from 'date-fns'
import { http, HttpResponse, type HttpHandler } from 'msw'
import type { Box, Loan, LoanRequest, LoanRequestStatus } from '../../types'
import { getCurrentMember } from '../auth/mocks'
import { games } from '../catalogue/mocks'
import {
  boxConditionSchema,
  boxSchema,
  isLoanLate,
  startLoanSchema,
  toDateString,
} from './lendingRules'

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

const isBoxOnLoan = (boxId: number) =>
  loans.some((loan) => loan.boxId === boxId && !loan.returnedOn)

export function toBoxDto(box: BoxRecord): Box {
  return { ...box, isOnLoan: isBoxOnLoan(box.id) }
}

export function toLoanDto({ requestId: _requestId, ...loan }: LoanRecord): Loan {
  return { ...loan, isLate: isLoanLate(loan) }
}

const boxNotFound = () =>
  HttpResponse.json({ message: 'Deze doos staat niet op de uitleenlijst.' }, { status: 404 })

// Alleen de eigenaar mag zijn doos aanpassen of weghalen, en niet zolang hij is uitgeleend
function refuseBoxChange(box: BoxRecord, memberId: string, onLoanMessage: string) {
  if (box.ownerId !== memberId) {
    return HttpResponse.json(
      { message: 'Je kunt alleen je eigen dozen aanpassen.' },
      { status: 403 },
    )
  }
  if (isBoxOnLoan(box.id)) {
    return HttpResponse.json({ message: onLoanMessage }, { status: 409 })
  }
}

const hasLoan = (requestId: number) => loans.some((loan) => loan.requestId === requestId)

// Goedgekeurd, maar de doos is nog niet overgedragen op een clubavond
const isAwaitingLoan = (loanRequest: LoanRequest) =>
  loanRequest.status === 'Approved' && !hasLoan(loanRequest.id)

const requestNotFound = () =>
  HttpResponse.json({ message: 'Deze aanvraag bestaat niet.' }, { status: 404 })

// Alleen de eigenaar van de doos beslist over een aanvraag, en alleen zolang hij in afwachting is
function refuseDecision(loanRequest: LoanRequest, memberId: string) {
  const box = boxes.find((b) => b.id === loanRequest.boxId)
  if (box?.ownerId !== memberId) {
    return HttpResponse.json(
      { message: 'Alleen de eigenaar van de doos kan deze aanvraag goedkeuren of afwijzen.' },
      { status: 403 },
    )
  }
  if (loanRequest.status !== 'Pending') {
    return HttpResponse.json({ message: 'Over deze aanvraag is al beslist.' }, { status: 409 })
  }
}

interface StartLoanBody {
  requestId: number
  returnDate: string
}

const ownerOf = (boxId: number) => boxes.find((b) => b.id === boxId)?.ownerId

export const lendingHandlers: HttpHandler[] = [
  http.get('/api/boxes', ({ request }) => {
    if (!getCurrentMember(request)) {
      return HttpResponse.json(
        { message: 'Log in om de uitleenlijst te bekijken.' },
        { status: 401 },
      )
    }
    return HttpResponse.json(boxes.map(toBoxDto))
  }),

  http.post('/api/boxes', async ({ request }) => {
    const me = getCurrentMember(request)
    if (!me) {
      return HttpResponse.json({ message: 'Log in om een doos aan te bieden.' }, { status: 401 })
    }
    const parsed = boxSchema.safeParse(await request.json())
    if (!parsed.success) {
      return HttpResponse.json({ message: parsed.error.issues[0].message }, { status: 400 })
    }
    const game = games.find((g) => g.id === parsed.data.gameId)
    if (!game) {
      return HttpResponse.json(
        { message: 'Deze game staat niet in de catalogus.' },
        { status: 404 },
      )
    }
    // Bewust geen controle op de collectie: je mag elke game uit de catalogus aanbieden
    const created: BoxRecord = {
      id: Math.max(0, ...boxes.map((b) => b.id)) + 1,
      ownerId: me.id,
      game,
      condition: parsed.data.condition,
    }
    boxes.push(created)
    return HttpResponse.json(toBoxDto(created), { status: 201 })
  }),

  http.put('/api/boxes/:id', async ({ request, params }) => {
    const me = getCurrentMember(request)
    if (!me) {
      return HttpResponse.json({ message: 'Log in om je doos aan te passen.' }, { status: 401 })
    }
    const box = boxes.find((b) => b.id === Number(params.id))
    if (!box) return boxNotFound()
    const refusal = refuseBoxChange(
      box,
      me.id,
      'Deze doos is uitgeleend en kan pas worden aangepast als hij terug is.',
    )
    if (refusal) return refusal
    const parsed = boxConditionSchema.safeParse(await request.json())
    if (!parsed.success) {
      return HttpResponse.json({ message: parsed.error.issues[0].message }, { status: 400 })
    }
    box.condition = parsed.data.condition
    return HttpResponse.json(toBoxDto(box))
  }),

  http.delete('/api/boxes/:id', ({ request, params }) => {
    const me = getCurrentMember(request)
    if (!me) {
      return HttpResponse.json(
        { message: 'Log in om je doos van de lijst te halen.' },
        { status: 401 },
      )
    }
    const box = boxes.find((b) => b.id === Number(params.id))
    if (!box) return boxNotFound()
    const refusal = refuseBoxChange(
      box,
      me.id,
      'Deze doos is uitgeleend en kan pas van de lijst als hij terug is.',
    )
    if (refusal) return refusal
    boxes.splice(boxes.indexOf(box), 1)
    // Openstaande aanvragen kunnen niet meer doorgaan, dus die worden afgewezen
    for (const loanRequest of loanRequests) {
      if (loanRequest.boxId === box.id && loanRequest.status === 'Pending') {
        loanRequest.status = 'Rejected'
      }
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // Aanvragen die ik deed en aanvragen op mijn dozen; de client verdeelt ze over de tabs
  http.get('/api/requests', ({ request }) => {
    const me = getCurrentMember(request)
    if (!me) {
      return HttpResponse.json({ message: 'Log in om je aanvragen te bekijken.' }, { status: 401 })
    }
    const myBoxIds = new Set(boxes.filter((b) => b.ownerId === me.id).map((b) => b.id))
    return HttpResponse.json(
      loanRequests.filter((r) => r.requesterId === me.id || myBoxIds.has(r.boxId)),
    )
  }),

  http.post('/api/boxes/:id/requests', ({ request, params }) => {
    const me = getCurrentMember(request)
    if (!me) {
      return HttpResponse.json({ message: 'Log in om een doos aan te vragen.' }, { status: 401 })
    }
    const box = boxes.find((b) => b.id === Number(params.id))
    if (!box) return boxNotFound()
    if (box.ownerId === me.id) {
      return HttpResponse.json(
        { message: 'Je kunt je eigen doos niet aanvragen.' },
        { status: 403 },
      )
    }
    // Een uitgeleende doos kan pas weer worden uitgeleend als hij terug is
    if (isBoxOnLoan(box.id)) {
      return HttpResponse.json(
        { message: 'Deze doos is uitgeleend en kan pas worden aangevraagd als hij terug is.' },
        { status: 409 },
      )
    }
    const alreadyRequested = loanRequests.some(
      (r) => r.boxId === box.id && r.requesterId === me.id && r.status === 'Pending',
    )
    if (alreadyRequested) {
      return HttpResponse.json({ message: 'Je hebt deze doos al aangevraagd.' }, { status: 409 })
    }
    const created: LoanRequest = {
      id: Math.max(0, ...loanRequests.map((r) => r.id)) + 1,
      boxId: box.id,
      requesterId: me.id,
      status: 'Pending',
      createdOn: toDateString(new Date()),
    }
    loanRequests.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.post('/api/requests/:id/approve', ({ request, params }) => {
    const me = getCurrentMember(request)
    if (!me) {
      return HttpResponse.json(
        { message: 'Log in om een aanvraag goed te keuren.' },
        { status: 401 },
      )
    }
    const loanRequest = loanRequests.find((r) => r.id === Number(params.id))
    if (!loanRequest) return requestNotFound()
    const refusal = refuseDecision(loanRequest, me.id)
    if (refusal) return refusal
    if (isBoxOnLoan(loanRequest.boxId)) {
      return HttpResponse.json(
        { message: 'Deze doos is uitgeleend en kan pas weer worden uitgeleend als hij terug is.' },
        { status: 409 },
      )
    }
    // Eén goedgekeurde aanvraag per keer, anders zouden twee leden dezelfde doos verwachten
    const awaitingLoan = loanRequests.some(
      (r) => r.boxId === loanRequest.boxId && isAwaitingLoan(r),
    )
    if (awaitingLoan) {
      return HttpResponse.json(
        { message: 'Er is al een aanvraag goedgekeurd die nog geen lening is.' },
        { status: 409 },
      )
    }
    loanRequest.status = 'Approved'
    // De doos gaat naar één lid, dus de andere openstaande aanvragen worden afgewezen
    for (const other of loanRequests) {
      if (other.boxId === loanRequest.boxId && other.status === 'Pending') {
        other.status = 'Rejected'
      }
    }
    return HttpResponse.json(loanRequest)
  }),

  http.post('/api/requests/:id/reject', ({ request, params }) => {
    const me = getCurrentMember(request)
    if (!me) {
      return HttpResponse.json({ message: 'Log in om een aanvraag af te wijzen.' }, { status: 401 })
    }
    const loanRequest = loanRequests.find((r) => r.id === Number(params.id))
    if (!loanRequest) return requestNotFound()
    const refusal = refuseDecision(loanRequest, me.id)
    if (refusal) return refusal
    loanRequest.status = 'Rejected'
    return HttpResponse.json(loanRequest)
  }),

  // Leningen waarin ik de doos uitleen of leen
  http.get('/api/loans', ({ request }) => {
    const me = getCurrentMember(request)
    if (!me) {
      return HttpResponse.json({ message: 'Log in om je leningen te bekijken.' }, { status: 401 })
    }
    return HttpResponse.json(
      loans
        .filter((loan) => loan.borrowerId === me.id || ownerOf(loan.boxId) === me.id)
        .map(toLoanDto),
    )
  }),

  // De eigenaar start de lening als de doos op de clubavond van eigenaar wisselt
  http.post('/api/loans', async ({ request }) => {
    const me = getCurrentMember(request)
    if (!me) {
      return HttpResponse.json({ message: 'Log in om een lening te starten.' }, { status: 401 })
    }
    const body = (await request.json()) as StartLoanBody
    const loanRequest = loanRequests.find((r) => r.id === Number(body.requestId))
    if (!loanRequest) return requestNotFound()
    const box = boxes.find((b) => b.id === loanRequest.boxId)
    if (!box) return boxNotFound()
    if (box.ownerId !== me.id) {
      return HttpResponse.json(
        { message: 'Alleen de eigenaar van de doos kan een lening starten.' },
        { status: 403 },
      )
    }
    if (loanRequest.status !== 'Approved') {
      return HttpResponse.json(
        { message: 'Een lening start alleen vanuit een goedgekeurde aanvraag.' },
        { status: 409 },
      )
    }
    if (hasLoan(loanRequest.id)) {
      return HttpResponse.json(
        { message: 'Voor deze aanvraag is de lening al gestart.' },
        { status: 409 },
      )
    }
    if (isBoxOnLoan(box.id)) {
      return HttpResponse.json(
        { message: 'Deze doos is uitgeleend en kan pas weer worden uitgeleend als hij terug is.' },
        { status: 409 },
      )
    }
    const parsed = startLoanSchema().safeParse(body)
    if (!parsed.success) {
      return HttpResponse.json({ message: parsed.error.issues[0].message }, { status: 400 })
    }
    const created: LoanRecord = {
      id: Math.max(0, ...loans.map((loan) => loan.id)) + 1,
      boxId: box.id,
      borrowerId: loanRequest.requesterId,
      startDate: toDateString(new Date()),
      returnDate: parsed.data.returnDate,
      isExtended: false,
      requestId: loanRequest.id,
    }
    loans.push(created)
    return HttpResponse.json(toLoanDto(created), { status: 201 })
  }),
]
