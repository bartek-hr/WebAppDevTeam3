import { Spinner } from 'react-bootstrap'

export default function PageSpinner({ label = 'Laden…' }: { label?: string }) {
  return (
    <div className="d-flex justify-content-center py-5">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">{label}</span>
      </Spinner>
    </div>
  )
}
