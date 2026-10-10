import { isAxiosError } from 'axios'

interface ErrorBody {
  message?: string
  detail?: string // ASP.NET ProblemDetails
  title?: string
}

// Haalt een leesbare foutmelding uit een API-fout. De mocks sturen { message }, de backend
// straks mogelijk ProblemDetails ({ title, detail }).
export function getErrorMessage(
  error: unknown,
  fallback = 'Er ging iets mis. Probeer het opnieuw.',
) {
  if (isAxiosError<ErrorBody>(error)) {
    if (!error.response) return 'Geen verbinding met de server.'
    const body = error.response.data
    return body?.message ?? body?.detail ?? body?.title ?? fallback
  }
  return fallback
}

export function isNotFound(error: unknown) {
  return isAxiosError(error) && error.response?.status === 404
}

// 4xx: het verzoek zelf klopt niet, dus opnieuw proberen heeft geen zin
export function isClientError(error: unknown) {
  const status = isAxiosError(error) ? error.response?.status : undefined
  return status !== undefined && status >= 400 && status < 500
}
