import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, TOKEN_KEY } from '../../api/client'
import type { Member } from '../../types'
import { AuthContext, type LoginInput, type RegisterInput } from './authContext'

interface AuthResponse {
  token: string
  member: Member
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [member, setMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(() => localStorage.getItem(TOKEN_KEY) !== null)

  // Sessie herstellen met het token uit een vorig bezoek
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return
    let cancelled = false
    api
      .get<Member>('/auth/me')
      .then(({ data }) => {
        if (!cancelled) setMember(data)
      })
      .catch(() => {
        if (!cancelled) localStorage.removeItem(TOKEN_KEY)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const startSession = useCallback(
    ({ token, member }: AuthResponse) => {
      localStorage.setItem(TOKEN_KEY, token)
      setMember(member)
      // Data van een vorig lid weggooien en opnieuw ophalen met het nieuwe token
      void queryClient.resetQueries()
    },
    [queryClient],
  )

  const login = useCallback(
    async (input: LoginInput) =>
      startSession((await api.post<AuthResponse>('/auth/login', input)).data),
    [startSession],
  )

  const registerAccount = useCallback(
    async (input: RegisterInput) =>
      startSession((await api.post<AuthResponse>('/auth/register', input)).data),
    [startSession],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setMember(null)
    queryClient.clear()
  }, [queryClient])

  const value = useMemo(
    () => ({
      member,
      isCommittee: member?.isCommittee ?? false,
      isLoading,
      login,
      registerAccount,
      logout,
    }),
    [member, isLoading, login, registerAccount, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
