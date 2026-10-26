import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import MockMemberSwitcher from '../features/auth/MockMemberSwitcher'
import { useAuth } from '../features/auth/useAuth'
import { LogoutIcon, MenuIcon, PersonIcon } from './icons'
import NavMenu from './NavMenu'
import './Layout.css'

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

export default function Layout() {
  const { member, isCommittee, logout } = useAuth()
  // Op smalle schermen zit het menu achter de menuknop
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="navbar">
        <div className="container navbar__inner">
          <NavLink to="/" className="navbar__brand">
            GameShelf
          </NavLink>
          <button
            type="button"
            className="navbar__toggle"
            aria-controls="main-nav"
            aria-expanded={menuOpen}
            aria-label="Menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon />
          </button>
          <nav
            id="main-nav"
            className={menuOpen ? 'navbar__nav is-open' : 'navbar__nav'}
            aria-label="Hoofdmenu"
            // Na het kiezen van een pagina gaat het menu op smalle schermen weer dicht
            onClick={(event) => {
              if ((event.target as HTMLElement).closest('a')) setMenuOpen(false)
            }}
          >
            <ul className="navbar__links">
              <li>
                <NavLink to="/catalogue" className="navbar__link">
                  Catalogus
                </NavLink>
              </li>
              <li>
                <NavMenu label="Mijn spellen">
                  <NavLink to="/collection" className="nav-menu__item">
                    Collectie
                  </NavLink>
                  <NavLink to="/shelves" className="nav-menu__item">
                    Planken
                  </NavLink>
                </NavMenu>
              </li>
              <li>
                <NavMenu label="Uitlenen">
                  <NavLink to="/lending" end className="nav-menu__item">
                    Uitleenlijst
                  </NavLink>
                  <NavLink to="/lending/mine" className="nav-menu__item">
                    Mijn uitleningen
                  </NavLink>
                </NavMenu>
              </li>
              <li>
                <NavLink to="/sessions" className="navbar__link">
                  Spelavonden
                </NavLink>
              </li>
              <li>
                <NavMenu label="Ruilen">
                  <NavLink to="/wishlists" end className="nav-menu__item">
                    Verlanglijsten
                  </NavLink>
                  <NavLink to="/wishlists/mine" className="nav-menu__item">
                    Mijn verlanglijst
                  </NavLink>
                  <NavLink to="/offers" className="nav-menu__item">
                    Mijn biedingen
                  </NavLink>
                </NavMenu>
              </li>
            </ul>
            {member && (
              <div className="navbar__user">
                <NavMenu
                  alignEnd
                  label={
                    <>
                      <PersonIcon />
                      {member.userName}
                      {isCommittee && <span className="badge badge--warning">Bestuur</span>}
                    </>
                  }
                >
                  <NavLink to={`/members/${member.id}`} className="nav-menu__item">
                    Mijn profiel
                  </NavLink>
                  {useMocks && <MockMemberSwitcher />}
                  <hr className="nav-menu__divider" />
                  <button type="button" className="nav-menu__item" onClick={logout}>
                    <LogoutIcon />
                    Uitloggen
                  </button>
                </NavMenu>
              </div>
            )}
          </nav>
        </div>
      </header>
      <div className="container page-content">
        <Outlet />
      </div>
    </>
  )
}
