import { format, parseISO } from 'date-fns'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import Alert from '../../components/Alert'
import PageSpinner from '../../components/PageSpinner'
import type { Game, OfferStatus } from '../../types'
import { formatEdition } from '../../utils/format'
import { useAuth } from '../auth/useAuth'
import { useOffers, type OfferOverview } from './api'
import { OFFER_VALIDITY_DAYS, offerValidUntil } from './tradingRules'
import './MyOffersPage.css'

type Direction = 'received' | 'sent'

const statuses: Record<OfferStatus, { label: string; variant: string }> = {
  Open: { label: 'Open', variant: 'primary' },
  Accepted: { label: 'Geaccepteerd', variant: 'success' },
  Rejected: { label: 'Afgewezen', variant: 'danger' },
  Cancelled: { label: 'Geannuleerd', variant: 'secondary' },
}

const sections: Record<Direction, { title: string; description: string; empty: string }> = {
  received: {
    title: 'Ontvangen biedingen',
    description: 'Andere leden bieden je een game van je verlanglijst aan.',
    empty: 'Je hebt nog geen biedingen ontvangen.',
  },
  sent: {
    title: 'Verstuurde biedingen',
    description: 'Je biedt een game aan van de verlanglijst van een ander lid.',
    empty: 'Je hebt nog geen biedingen verstuurd.',
  },
}

// Open biedingen zijn geldig of verlopen; de andere statussen zijn afgesloten
function validityOf(offer: OfferOverview) {
  if (offer.status !== 'Open')
    return { state: 'closed', label: 'Afgesloten', until: 'geldigheid t/m' }
  return offer.isValid
    ? { state: 'valid', label: 'Geldig', until: 't/m' }
    : { state: 'expired', label: 'Verlopen', until: 'geldig t/m' }
}

function TradeSide({
  label,
  game,
  incoming,
  fulfilled = false,
}: {
  label: string
  game: Game
  incoming: boolean
  fulfilled?: boolean
}) {
  return (
    <div className={`my-offers__side my-offers__side--${incoming ? 'in' : 'out'}`}>
      <dt>{label}</dt>
      <dd>
        <Link to={`/catalogue/${game.id}`} className="my-offers__game">
          {game.title}
        </Link>
        <span className="my-offers__edition">{formatEdition(game)}</span>
        {fulfilled && (
          <span className="badge badge--success my-offers__fulfilled">
            Verlanglijstitem vervuld
          </span>
        )}
      </dd>
    </div>
  )
}

function OfferRow({ offer, direction }: { offer: OfferOverview; direction: Direction }) {
  const received = direction === 'received'
  const status = statuses[offer.status]
  const counterparty = received ? offer.offeredBy : offer.owner
  const validity = validityOf(offer)
  const validUntil = offerValidUntil(offer.createdOn)

  return (
    <article className="my-offers__offer">
      <header className="my-offers__party">
        <h3 className="my-offers__party-name">
          {received ? 'Bod van ' : 'Bod aan '}
          <Link to={`/members/${counterparty.id}`}>{counterparty.userName}</Link>
        </h3>
        <span className={`badge badge--${status.variant}`}>{status.label}</span>
      </header>

      {/* Het verlanglijstitem staat altijd eerst; blauw is wat jij krijgt */}
      <dl className="my-offers__exchange">
        <TradeSide
          label={received ? 'Je ontvangt' : 'Je biedt aan'}
          game={offer.wishlistItem.game}
          incoming={received}
          fulfilled={offer.wishlistItem.isFulfilled}
        />
        <TradeSide
          label={received ? 'Je geeft terug' : 'Je vraagt terug'}
          game={offer.askedGame}
          incoming={!received}
        />
      </dl>

      <dl className="my-offers__terms">
        <div>
          <dt>Verstuurd op</dt>
          <dd>
            <time dateTime={offer.createdOn}>
              {format(parseISO(offer.createdOn), 'dd-MM-yyyy')}
            </time>
          </dd>
        </div>
        <div>
          <dt>Geldigheid</dt>
          <dd>
            <span className={`my-offers__state my-offers__state--${validity.state}`}>
              {validity.label}
            </span>
            <span className="my-offers__until">
              {validity.until}{' '}
              <time dateTime={format(validUntil, 'yyyy-MM-dd')}>
                {format(validUntil, 'dd-MM-yyyy')}
              </time>
            </span>
          </dd>
        </div>
      </dl>
    </article>
  )
}

function OfferSection({ offers, direction }: { offers: OfferOverview[]; direction: Direction }) {
  const section = sections[direction]
  const headingId = `${direction}-heading`

  return (
    <section className="my-offers__section" aria-labelledby={headingId}>
      <div className="my-offers__section-head">
        <h2 id={headingId} className="my-offers__section-title">
          {section.title} <span className="my-offers__count">({offers.length})</span>
        </h2>
        <p className="my-offers__section-description">{section.description}</p>
      </div>
      {offers.length === 0 ? (
        <Alert variant="neutral">{section.empty}</Alert>
      ) : (
        <ul className="my-offers__ledger">
          {offers.map((offer) => (
            <li key={offer.id}>
              <OfferRow offer={offer} direction={direction} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function MyOffersPage() {
  const { member } = useAuth()
  const { data: offers = [], isPending, isError, error, refetch } = useOffers(member?.id)

  return (
    <div className="my-offers">
      <div className="my-offers__intro">
        <h1 className="my-offers__title">Mijn biedingen</h1>
        <p className="my-offers__lead">
          Een open bod is {OFFER_VALIDITY_DAYS} dagen geldig, tot en met de vermelde datum.
          Biedingen accepteren, afwijzen en annuleren volgt later.
        </p>
      </div>
      {isPending ? (
        <PageSpinner />
      ) : isError ? (
        <Alert variant="danger">
          {getErrorMessage(error)}{' '}
          <button
            type="button"
            className="btn btn--outline-danger btn--sm"
            onClick={() => void refetch()}
          >
            Opnieuw proberen
          </button>
        </Alert>
      ) : (
        <>
          <OfferSection
            offers={offers.filter((offer) => offer.wishlistItem.ownerId === member?.id)}
            direction="received"
          />
          <OfferSection
            offers={offers.filter((offer) => offer.offeredById === member?.id)}
            direction="sent"
          />
        </>
      )}
    </div>
  )
}
