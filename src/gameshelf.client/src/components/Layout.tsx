import { Badge, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { BoxArrowRight, PersonCircle } from 'react-bootstrap-icons'
import { NavLink, Outlet } from 'react-router-dom'
import MockMemberSwitcher from '../features/auth/MockMemberSwitcher'
import { useAuth } from '../features/auth/useAuth'

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

export default function Layout() {
  const { member, isCommittee, logout } = useAuth()

  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={NavLink} to="/">
            GameShelf
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/catalogue">
                Catalogus
              </Nav.Link>
              <NavDropdown title="Mijn spellen">
                <NavDropdown.Item as={NavLink} to="/collection">
                  Collectie
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/shelves">
                  Planken
                </NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title="Uitlenen">
                <NavDropdown.Item as={NavLink} to="/lending">
                  Uitleenlijst
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/lending/mine">
                  Mijn uitleningen
                </NavDropdown.Item>
              </NavDropdown>
              <Nav.Link as={NavLink} to="/sessions">
                Spelavonden
              </Nav.Link>
              <NavDropdown title="Ruilen">
                <NavDropdown.Item as={NavLink} to="/wishlists">
                  Verlanglijsten
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/wishlists/mine">
                  Mijn verlanglijst
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/offers">
                  Mijn biedingen
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
            {member && (
              <Nav>
                <NavDropdown
                  align="end"
                  id="user-menu"
                  title={
                    <>
                      <PersonCircle className="me-1" />
                      {member.userName}
                      {isCommittee && (
                        <Badge bg="warning" text="dark" className="ms-2">
                          Bestuur
                        </Badge>
                      )}
                    </>
                  }
                >
                  <NavDropdown.Item as={NavLink} to={`/members/${member.id}`}>
                    Mijn profiel
                  </NavDropdown.Item>
                  {useMocks && <MockMemberSwitcher />}
                  <NavDropdown.Divider />
                  <NavDropdown.Item as="button" onClick={logout}>
                    <BoxArrowRight className="me-2" />
                    Uitloggen
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="pb-5">
        <Outlet />
      </Container>
    </>
  )
}
