import { Navigate, Outlet, useLocation } from 'react-router-dom'
import PageSpinner from '../../components/PageSpinner'
import { useAuth } from './useAuth'

// Wie niet is ingelogd gaat naar /login, en komt na het inloggen terug op deze pagina
export default function ProtectedRoute() {
  const { member, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageSpinner />
  if (!member) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}
