import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom'
import { TOKEN_KEY } from '../api/client'
import AuthProvider from '../features/auth/AuthProvider'

// Rendert routes met dezelfde providers als de app: React Query, auth en de router
export function renderRoutes(routes: RouteObject[], initialPath = '/') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] })
  const result = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>,
  )
  return { ...result, router }
}

// Start de test als ingelogd mocklid (zie features/auth/mocks.ts voor de id's)
export function loginAs(memberId: string) {
  localStorage.setItem(TOKEN_KEY, `mock-token-${memberId}`)
}
