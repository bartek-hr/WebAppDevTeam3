// Gedeelde domeintypes voor GameShelf. Houd deze gelijk aan de DTO's van de backend.

export interface Member {
  id: string
  userName: string
  email: string
  isCommittee: boolean
}

// Catalogus: één game = één editie (NL en EN editie zijn twee games)
export interface Game {
  id: number
  title: string
  publisher: string
  releaseYear: number
  category: string
  minPlayers: number
  maxPlayers: number
  playingTimeMinutes: number
  boxImageUrl?: string
}

// Collecties en planken
export type RecordStatus = 'NotPlayed' | 'InProgress' | 'Played'

export interface CollectionRecord {
  id: number
  ownerId: string
  game: Game
  status: RecordStatus
  plays: number
  rating?: number // alleen bij status Played
  note?: string
}

export interface Shelf {
  id: number
  ownerId: string
  name: string
  description: string
  isPublic: boolean
  recordIds: number[]
}

// Uitlenen
export interface Box {
  id: number
  ownerId: string
  game: Game
  condition: string
}

export type LoanRequestStatus = 'Pending' | 'Approved' | 'Rejected'

export interface LoanRequest {
  id: number
  boxId: number
  requesterId: string
  status: LoanRequestStatus
}

export interface Loan {
  id: number
  boxId: number
  borrowerId: string
  startDate: string
  returnDate: string
  isExtended: boolean
  returnedOn?: string
  isLate: boolean // berekend door de backend, nooit handmatig
}

// Spelavonden
export interface GameSession {
  id: number
  hostId: string
  title: string
  startsAt: string
  place: string
  capacity: number
  isCancelled: boolean
}

export interface Signup {
  id: number
  sessionId: number
  memberId: string
  isConfirmed: boolean
  createdAt: string
  broughtGame?: Game
}

// Verlanglijst en ruilen
export interface WishlistItem {
  id: number
  ownerId: string
  game: Game
  priority: number
  note?: string
  isFulfilled: boolean
}

export type OfferStatus = 'Open' | 'Accepted' | 'Rejected' | 'Cancelled'

export interface Offer {
  id: number
  wishlistItemId: number
  offeredById: string
  askedGame: Game
  createdOn: string
  status: OfferStatus
  isValid: boolean // berekend uit de geldigheidstermijn
}
