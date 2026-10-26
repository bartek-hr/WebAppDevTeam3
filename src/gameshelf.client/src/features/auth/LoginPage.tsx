import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, type Location } from 'react-router-dom'
import { z } from 'zod'
import { getErrorMessage } from '../../api/errors'
import Alert from '../../components/Alert'
import PageSpinner from '../../components/PageSpinner'
import AuthCard from './AuthCard'
import MockLoginHint from './MockLoginHint'
import { useAuth } from './useAuth'

const loginSchema = z.object({
  userNameOrEmail: z.string().trim().min(1, 'Vul je gebruikersnaam of e-mailadres in'),
  password: z.string().min(1, 'Vul je wachtwoord in'),
})

type LoginValues = z.infer<typeof loginSchema>

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

export default function LoginPage() {
  const { member, isLoading, login } = useAuth()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  if (isLoading) return <PageSpinner />
  if (member) {
    // Terug naar de pagina waar ProtectedRoute vandaan stuurde
    const from = (location.state as { from?: Location } | null)?.from
    return <Navigate to={from ? from.pathname + from.search : '/'} replace />
  }

  const onSubmit = async (values: LoginValues) => {
    setServerError(null)
    try {
      await login(values)
    } catch (error) {
      setServerError(getErrorMessage(error))
    }
  }

  return (
    <AuthCard
      title="Inloggen"
      footer={
        <>
          Nog geen account? <Link to="/register">Registreer je</Link>
        </>
      }
    >
      {serverError && <Alert variant="danger">{serverError}</Alert>}
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="field">
          <label htmlFor="userNameOrEmail" className="field__label">
            Gebruikersnaam of e-mailadres
          </label>
          <input
            id="userNameOrEmail"
            className="input"
            autoComplete="username"
            autoFocus
            aria-invalid={!!errors.userNameOrEmail}
            aria-describedby={errors.userNameOrEmail ? 'userNameOrEmail-error' : undefined}
            {...register('userNameOrEmail')}
          />
          {errors.userNameOrEmail && (
            <div id="userNameOrEmail-error" className="field__error">
              {errors.userNameOrEmail.message}
            </div>
          )}
        </div>
        <div className="field">
          <label htmlFor="password" className="field__label">
            Wachtwoord
          </label>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          {errors.password && (
            <div id="password-error" className="field__error">
              {errors.password.message}
            </div>
          )}
        </div>
        <button type="submit" className="btn btn--primary btn--block" disabled={isSubmitting}>
          {isSubmitting ? 'Bezig met inloggen…' : 'Inloggen'}
        </button>
      </form>
      {useMocks && <MockLoginHint />}
    </AuthCard>
  )
}
