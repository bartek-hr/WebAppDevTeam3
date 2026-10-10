import { useContext } from 'react'
import { AuthContext } from './authContext'

// Het ingelogde lid: const { member, isCommittee, login, logout } = useAuth()
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth() moet binnen <AuthProvider> gebruikt worden')
  return value
}
