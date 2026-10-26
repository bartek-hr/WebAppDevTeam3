import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate } from 'react-router-dom'
import { z } from 'zod'
import { getErrorMessage } from '../../api/errors'
import Alert from '../../components/Alert'
import PageSpinner from '../../components/PageSpinner'
import AuthCard from './AuthCard'
import { useAuth } from './useAuth'

const registerSchema = z
  .object({
    userName: z
      .string()
      .trim()
      .min(3, 'Minimaal 3 tekens')
      .max(30, 'Maximaal 30 tekens')
      .regex(/^[a-zA-Z0-9._-]+$/, 'Alleen letters, cijfers, punt, streepje en underscore'),
    email: z.email('Vul een geldig e-mailadres in'),
    password: z.string().min(8, 'Minimaal 8 tekens'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: 'De wachtwoorden zijn niet gelijk',
    path: ['confirmPassword'],
  })

type RegisterValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const { member, isLoading, registerAccount } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })

  if (isLoading) return <PageSpinner />
  if (member) return <Navigate to="/" replace />

  const onSubmit = async ({ userName, email, password }: RegisterValues) => {
    setServerError(null)
    try {
      await registerAccount({ userName, email, password })
    } catch (error) {
      setServerError(getErrorMessage(error))
    }
  }

  return (
    <AuthCard
      title="Account aanmaken"
      footer={
        <>
          Al een account? <Link to="/login">Log in</Link>
        </>
      }
    >
      {serverError && <Alert variant="danger">{serverError}</Alert>}
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="field">
          <label htmlFor="userName" className="field__label">
            Gebruikersnaam
          </label>
          <input
            id="userName"
            className="input"
            autoComplete="username"
            autoFocus
            aria-invalid={!!errors.userName}
            aria-describedby={errors.userName ? 'userName-error' : undefined}
            {...register('userName')}
          />
          {errors.userName && (
            <div id="userName-error" className="field__error">
              {errors.userName.message}
            </div>
          )}
        </div>
        <div className="field">
          <label htmlFor="email" className="field__label">
            E-mailadres
          </label>
          <input
            id="email"
            className="input"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <div id="email-error" className="field__error">
              {errors.email.message}
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
            autoComplete="new-password"
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
        <div className="field">
          <label htmlFor="confirmPassword" className="field__label">
            Wachtwoord herhalen
          </label>
          <input
            id="confirmPassword"
            className="input"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <div id="confirmPassword-error" className="field__error">
              {errors.confirmPassword.message}
            </div>
          )}
        </div>
        <button type="submit" className="btn btn--primary btn--block" disabled={isSubmitting}>
          {isSubmitting ? 'Bezig…' : 'Account aanmaken'}
        </button>
      </form>
    </AuthCard>
  )
}
