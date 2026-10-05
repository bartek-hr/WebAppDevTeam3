import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'

// Rooktest: laat zien hoe een componenttest eruitziet (npm test)
test('toont de navigatiebalk', () => {
  const router = createMemoryRouter([{ path: '/', element: <Layout /> }])
  render(<RouterProvider router={router} />)
  expect(screen.getByText('GameShelf')).toBeInTheDocument()
})
