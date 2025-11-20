/**
 * MSW Server setup for Node environment (tests)
 */

import { setupServer } from 'msw/node'
import { handlers } from './msw-handlers'

// Set up MSW server with default handlers
export const server = setupServer(...handlers)
