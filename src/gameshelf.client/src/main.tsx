import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import { isClientError } from './api/errors'
import AuthProvider from './features/auth/AuthProvider'
import { router } from './routes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Bij 4xx (bijv. 404) heeft opnieuw proberen geen zin
      retry: (failureCount, error) => failureCount < 2 && !isClientError(error),
    },
  },
})

async function enableMocks() {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true') {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }
}

enableMocks().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
})
