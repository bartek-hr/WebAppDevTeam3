export default function PageSpinner({ label = 'Laden…' }: { label?: string }) {
  return (
    <div className="page-spinner">
      <div className="spinner" role="status">
        <span className="visually-hidden">{label}</span>
      </div>
    </div>
  )
}
