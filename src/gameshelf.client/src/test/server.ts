import { setupServer } from 'msw/node'
import { handlers } from '../mocks/handlers'

// Dezelfde nep-API als in de browser, nu voor de tests
export const server = setupServer(...handlers)
