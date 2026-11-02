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

const statuses: Record<OfferStatus, { label: string; variant: string }> = {
  Open: { label: 'Open', variant: 'primary' },
  Accepted: { label: 'Geaccepteerd', variant: 'success' },
  Rejected: { label: 'Afgewezen', variant: 'danger' },
  Cancelled: { label: 'Geannuleerd', variant: 'secondary' },
}

function GameDetails({ game }: { game: Game }) {
  return (
    <>
      <Link to={`/catalogue/${game.id}`}>{game.title}</Link>
      <div className="text-muted text-small">{formatEdition(game)}</div>
    </>
  )
}

function OfferList({
  offers,
  direction,
}: {
  offers: OfferOverview[]
  direction: 'received' | 'sent'
}) {
  const received = direction === 'received'
  return (
    <section className="my-offers__section" aria-labelledby={`${direction}-heading`}>
      <h2 id={`${direction}-heading`}>
        {received ? 'Ontvangen biedingen' : 'Verstuurde biedingen'} ({offers.length})
      </h2>
      {offers.length === 0 ? (
        <Alert variant="neutral">
          {received
            ? 'Je hebt nog geen biedingen ontvangen.'
            : 'Je hebt nog geen biedingen verstuurd.'}
        </Alert>
      ) : (
        <ul className="my-offers__list">
          {offers.map((offer) => {
            const status = statuses[offer.status]
            return (
              <li key={offer.id} className="card">
                <article className="card__body">
                  <div className="my-offers__header">
                    <h3 className="card__title">
                      {received ? 'Bod van ' : 'Bod aan '}
                      <Link to={`/members/${received ? offer.offeredBy.id : offer.owner.id}`}>
                        {received ? offer.offeredBy.userName : offer.owner.userName}
                      </Link>
                    </h3>
                    <span className={`badge badge--${status.variant}`}>{status.label}</span>
                  </div>
                  <dl className="my-offers__details">
                    <div>
                      <dt>{received ? 'Je ontvangt' : 'Je biedt aan'}</dt>
                      <dd>
                        <GameDetails game={offer.wishlistItem.game} />
                      </dd>
                    </div>
                    <div>
                      <dt>{received ? 'Je geeft terug' : 'Je vraagt terug'}</dt>
                      <dd>
                        <GameDetails game={offer.askedGame} />
                      </dd>
                    </div>
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
                        {offer.status !== 'Open'
                          ? 'Afgesloten'
                          : offer.isValid
                            ? 'Geldig'
                            : 'Verlopen'}
                        <div className="text-muted text-small">
                          {offer.status === 'Open' && !offer.isValid
                            ? 'Geldig t/m '
                            : 'Geldigheid t/m '}
                          <time dateTime={format(offerValidUntil(offer.createdOn), 'yyyy-MM-dd')}>
                            {format(offerValidUntil(offer.createdOn), 'dd-MM-yyyy')}
                          </time>
                        </div>
                      </dd>
                    </div>
                  </dl>
                  {offer.wishlistItem.isFulfilled && (
                    <span className="badge badge--success">Verlanglijstitem vervuld</span>
                  )}
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default function MyOffersPage() {
  const { member } = useAuth()
  const { data: offers = [], isPending, isError, error, refetch } = useOffers(member?.id)

  return (
    <>
      <div className="page-header">
        <h1>Mijn biedingen</h1>
      </div>
      <p className="text-muted">
        Bekijk je ontvangen en verstuurde biedingen. Een open bod is {OFFER_VALIDITY_DAYS} dagen
        geldig, tot en met de vermelde datum. Biedingen accepteren, afwijzen en annuleren volgt
        later.
      </p>
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
          <OfferList
            offers={offers.filter((offer) => offer.wishlistItem.ownerId === member?.id)}
            direction="received"
          />
          <OfferList
            offers={offers.filter((offer) => offer.offeredById === member?.id)}
            direction="sent"
          />
        </>
      )}
    </>
  )
}
