import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout'
import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'
import HomePage from './features/home/HomePage'
import CataloguePage from './features/catalogue/CataloguePage'
import GameDetailPage from './features/catalogue/GameDetailPage'
import AddGamePage from './features/catalogue/AddGamePage'
import CollectionPage from './features/collection/CollectionPage'
import MemberProfilePage from './features/collection/MemberProfilePage'
import ShelvesPage from './features/shelves/ShelvesPage'
import ShelfDetailPage from './features/shelves/ShelfDetailPage'
import LendingListPage from './features/lending/LendingListPage'
import MyLendingPage from './features/lending/MyLendingPage'
import MyOffersPage from './features/trading/MyOffersPage'
import SessionsPage from './features/sessions/SessionsPage'
import SessionDetailPage from './features/sessions/SessionDetailPage'
import SessionFormPage from './features/sessions/SessionFormPage'
import WishlistsPage from './features/wishlist/WishlistsPage'
import MyWishlistPage from './features/wishlist/MyWishlistPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/catalogue', element: <CataloguePage /> },
      { path: '/catalogue/new', element: <AddGamePage /> },
      { path: '/catalogue/:id', element: <GameDetailPage /> },
      { path: '/collection', element: <CollectionPage /> },
      { path: '/members/:id', element: <MemberProfilePage /> },
      { path: '/shelves', element: <ShelvesPage /> },
      { path: '/shelves/:id', element: <ShelfDetailPage /> },
      { path: '/lending', element: <LendingListPage /> },
      { path: '/lending/mine', element: <MyLendingPage /> },
      { path: '/offers', element: <MyOffersPage /> },
      { path: '/sessions', element: <SessionsPage /> },
      { path: '/sessions/new', element: <SessionFormPage /> },
      { path: '/sessions/:id', element: <SessionDetailPage /> },
      { path: '/sessions/:id/edit', element: <SessionFormPage /> },
      { path: '/wishlists', element: <WishlistsPage /> },
      { path: '/wishlists/mine', element: <MyWishlistPage /> },
    ],
  },
])
