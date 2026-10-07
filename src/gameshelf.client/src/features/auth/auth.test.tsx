import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { RouteObject } from 'react-router-dom'
import Layout from '../../components/Layout'
import { loginAs, renderRoutes } from '../../test/utils'
import LoginPage from './LoginPage'
import ProtectedRoute from './ProtectedRoute'

const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [{ path: '/catalogue', element: <h1>Testpagina</h1> }],
      },
    ],
  },
]

async function fillInLogin(userNameOrEmail: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Gebruikersnaam of e-mailadres'), userNameOrEmail)
  await user.type(screen.getByLabelText('Wachtwoord'), 'testwachtwoord')
  await user.click(screen.getByRole('button', { name: 'Inloggen' }))
}

test('stuurt een niet-ingelogd lid naar de inlogpagina en daarna terug', async () => {
  renderRoutes(routes, '/catalogue')

  expect(await screen.findByRole('heading', { name: 'Inloggen' })).toBeInTheDocument()
  await fillInLogin('daan@gameshelf.test')

  expect(await screen.findByRole('heading', { name: 'Testpagina' })).toBeInTheDocument()
  expect(screen.getByText('daan')).toBeInTheDocument()
})

test('toont een foutmelding bij een onbekend lid', async () => {
  renderRoutes(routes, '/login')

  await fillInLogin('onbekend')

  expect(await screen.findByRole('alert')).toHaveTextContent('klopt niet')
})

test('herstelt een opgeslagen sessie en toont het bestuurslabel', async () => {
  loginAs('m1')
  renderRoutes(routes, '/catalogue')

  expect(await screen.findByRole('heading', { name: 'Testpagina' })).toBeInTheDocument()
  expect(screen.getByText('Bestuur')).toBeInTheDocument()
})

test('uitloggen gaat terug naar de inlogpagina', async () => {
  const user = userEvent.setup()
  loginAs('m2')
  renderRoutes(routes, '/catalogue')

  await user.click(await screen.findByText('daan'))
  await user.click(screen.getByRole('button', { name: 'Uitloggen' }))

  expect(await screen.findByRole('heading', { name: 'Inloggen' })).toBeInTheDocument()
})
