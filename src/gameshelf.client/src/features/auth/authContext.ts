import { createContext } from 'react'
import type { Member } from '../../types'

export interface LoginInput {
  userNameOrEmail: string
  password: string
}

export interface RegisterInput {
  userName: string
  email: string
  password: string
}

export interface AuthContextValue {
  member: Member | null
  isCommittee: boolean
  // true zolang een opgeslagen sessie bij het opstarten nog wordt gecontroleerd
  isLoading: boolean
  login: (input: LoginInput) => Promise<void>
  registerAccount: (input: RegisterInput) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
