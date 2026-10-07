import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="text-center py-5">
      <h1>Pagina niet gevonden</h1>
      <p className="text-body-secondary">Deze pagina bestaat niet (meer).</p>
      <Link to="/">Naar de startpagina</Link>
    </div>
  )
}
