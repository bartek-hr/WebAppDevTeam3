import { GlobeIcon, LockIcon } from '../../components/icons'

export default function ShelfVisibility({ isPublic }: { isPublic: boolean }) {
  return isPublic ? (
    <span className="badge badge--success">
      <GlobeIcon />
      Openbaar
    </span>
  ) : (
    <span className="badge badge--secondary">
      <LockIcon />
      Privé
    </span>
  )
}
