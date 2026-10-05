import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
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
            <Nav>
              <Nav.Link as={NavLink} to="/login">
                Inloggen
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="pb-5">
        <Outlet />
      </Container>
    </>
  )
}
