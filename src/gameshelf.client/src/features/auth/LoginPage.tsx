import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, type Location } from 'react-router-dom'
import { z } from 'zod'
import { getErrorMessage } from '../../api/errors'
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
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Form.Group className="mb-3" controlId="userNameOrEmail">
          <Form.Label>Gebruikersnaam of e-mailadres</Form.Label>
          <Form.Control
            autoComplete="username"
            autoFocus
            isInvalid={!!errors.userNameOrEmail}
            {...register('userNameOrEmail')}
          />
          <Form.Control.Feedback type="invalid">
            {errors.userNameOrEmail?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Wachtwoord</Form.Label>
          <Form.Control
            type="password"
            autoComplete="current-password"
            isInvalid={!!errors.password}
            {...register('password')}
          />
          <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
        </Form.Group>
        <Button type="submit" className="w-100" disabled={isSubmitting}>
          {isSubmitting ? 'Bezig met inloggen…' : 'Inloggen'}
        </Button>
      </Form>
      {useMocks && <MockLoginHint />}
    </AuthCard>
  )
}
