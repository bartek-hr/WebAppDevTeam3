import type { ReactNode } from 'react'
import { Card, Container } from 'react-bootstrap'

interface AuthCardProps {
  title: string
  children: ReactNode
  footer?: ReactNode
}

// Gedeelde opmaak voor inloggen en registreren (zonder navbar)
export default function AuthCard({ title, children, footer }: AuthCardProps) {
  return (
    <Container className="py-5" style={{ maxWidth: 440 }}>
      <p className="h3 text-center mb-4">GameShelf</p>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h1 className="h5 mb-3">{title}</h1>
          {children}
        </Card.Body>
      </Card>
      {footer && <p className="text-center mt-3">{footer}</p>}
    </Container>
  )
}
