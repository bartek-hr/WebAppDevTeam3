import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <h1>Pagina niet gevonden</h1>
      <p className="text-muted">Deze pagina bestaat niet (meer).</p>
      <Link to="/">Naar de startpagina</Link>
    </div>
  )
}
