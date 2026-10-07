import { screen } from '@testing-library/react'
import Layout from './components/Layout'
import { renderRoutes } from './test/utils'

// Rooktest: laat zien hoe een componenttest eruitziet (npm test)
test('toont de navigatiebalk', () => {
  renderRoutes([{ path: '/', element: <Layout /> }])
  expect(screen.getByText('GameShelf')).toBeInTheDocument()
})
