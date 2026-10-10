import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { Link, Navigate } from 'react-router-dom'
import { z } from 'zod'
import { getErrorMessage } from '../../api/errors'
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
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Form.Group className="mb-3" controlId="userName">
          <Form.Label>Gebruikersnaam</Form.Label>
          <Form.Control
            autoComplete="username"
            autoFocus
            isInvalid={!!errors.userName}
            {...register('userName')}
          />
          <Form.Control.Feedback type="invalid">{errors.userName?.message}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>E-mailadres</Form.Label>
          <Form.Control
            type="email"
            autoComplete="email"
            isInvalid={!!errors.email}
            {...register('email')}
          />
          <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Wachtwoord</Form.Label>
          <Form.Control
            type="password"
            autoComplete="new-password"
            isInvalid={!!errors.password}
            {...register('password')}
          />
          <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>Wachtwoord herhalen</Form.Label>
          <Form.Control
            type="password"
            autoComplete="new-password"
            isInvalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
          <Form.Control.Feedback type="invalid">
            {errors.confirmPassword?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <Button type="submit" className="w-100" disabled={isSubmitting}>
          {isSubmitting ? 'Bezig…' : 'Account aanmaken'}
        </Button>
      </Form>
    </AuthCard>
  )
}
