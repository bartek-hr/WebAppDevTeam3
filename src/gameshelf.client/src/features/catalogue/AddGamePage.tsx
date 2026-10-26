import { zodResolver } from '@hookform/resolvers/zod'
import { useState, type ChangeEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import Alert from '../../components/Alert'
import { formatEdition } from '../../utils/format'
import { useCreateGame, useGames } from './api'
import { findDuplicate, findEditions, gameSchema, type NewGame } from './gameSchema'
import './AddGamePage.css'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024

export default function AddGamePage() {
  const navigate = useNavigate()
  const { data: games = [] } = useGames()
  const createGame = useCreateGame()
  const [imageError, setImageError] = useState<string | null>(null)
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NewGame>({
    resolver: zodResolver(gameSchema),
    defaultValues: { title: '', publisher: '', category: '' },
  })

  const [title, publisher, releaseYear, boxImageUrl] = useWatch({
    control,
    name: ['title', 'publisher', 'releaseYear', 'boxImageUrl'],
  })
  const duplicate =
    title && publisher && releaseYear
      ? findDuplicate(games, { title, publisher, releaseYear })
      : undefined
  const otherEditions = title ? findEditions(games, title) : []
  const categories = [...new Set(games.map((game) => game.category))].sort((a, b) =>
    a.localeCompare(b, 'nl'),
  )

  // In de mock bewaren we de foto als data-URL. Met de echte backend wordt dit een upload.
  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setImageError(null)
    setValue('boxImageUrl', undefined)
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('Kies een afbeelding (bijv. JPG of PNG).')
    } else if (file.size > MAX_IMAGE_BYTES) {
      setImageError('De foto mag maximaal 2 MB zijn.')
    } else {
      const reader = new FileReader()
      reader.onload = () => setValue('boxImageUrl', reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (values: NewGame) => {
    try {
      const game = await createGame.mutateAsync(values)
      navigate(`/catalogue/${game.id}`)
    } catch {
      // De fout staat in createGame.error en wordt hieronder getoond
    }
  }

  return (
    <div className="page-narrow">
      <h1>Game toevoegen</h1>
      <p className="text-muted">
        Mist er een game in de catalogus? Voeg hem toe, dan kan iedereen hem gebruiken in hun
        collectie, uitleenlijst en verlanglijst.
      </p>

      {createGame.isError && <Alert variant="danger">{getErrorMessage(createGame.error)}</Alert>}

      <div className="card">
        <div className="card__body">
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <div className="field">
              <label htmlFor="title" className="field__label">
                Titel
              </label>
              <input
                id="title"
                className="input"
                autoFocus
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? 'title-error' : undefined}
                {...register('title')}
              />
              {errors.title && (
                <div id="title-error" className="field__error">
                  {errors.title.message}
                </div>
              )}
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="publisher" className="field__label">
                  Uitgever
                </label>
                <input
                  id="publisher"
                  className="input"
                  aria-invalid={!!errors.publisher}
                  aria-describedby={errors.publisher ? 'publisher-error' : undefined}
                  {...register('publisher')}
                />
                {errors.publisher && (
                  <div id="publisher-error" className="field__error">
                    {errors.publisher.message}
                  </div>
                )}
              </div>
              <div className="field">
                <label htmlFor="releaseYear" className="field__label">
                  Jaar van uitgave
                </label>
                <input
                  id="releaseYear"
                  type="number"
                  inputMode="numeric"
                  className="input"
                  aria-invalid={!!errors.releaseYear}
                  aria-describedby={errors.releaseYear ? 'releaseYear-error' : undefined}
                  {...register('releaseYear', { valueAsNumber: true })}
                />
                {errors.releaseYear && (
                  <div id="releaseYear-error" className="field__error">
                    {errors.releaseYear.message}
                  </div>
                )}
              </div>
            </div>

            {duplicate ? (
              <Alert variant="warning">
                Deze editie staat al in de catalogus:{' '}
                <Link to={`/catalogue/${duplicate.id}`}>
                  {duplicate.title} ({formatEdition(duplicate)})
                </Link>
                .
              </Alert>
            ) : (
              otherEditions.length > 0 && (
                <Alert variant="info">
                  Er {otherEditions.length === 1 ? 'staat' : 'staan'} al{' '}
                  {otherEditions.length === 1 ? 'een andere editie' : 'andere edities'} van deze
                  titel in de catalogus (
                  {otherEditions.map((edition) => formatEdition(edition)).join('; ')}). Een andere
                  doos is een aparte game, dus dat mag.
                </Alert>
              )
            )}

            <div className="field-row">
              <div className="field">
                <label htmlFor="category" className="field__label">
                  Categorie
                </label>
                <input
                  id="category"
                  className="input"
                  list="category-options"
                  aria-invalid={!!errors.category}
                  aria-describedby={errors.category ? 'category-error' : undefined}
                  {...register('category')}
                />
                <datalist id="category-options">
                  {categories.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
                {errors.category && (
                  <div id="category-error" className="field__error">
                    {errors.category.message}
                  </div>
                )}
              </div>
              <div className="field">
                <label htmlFor="playingTimeMinutes" className="field__label">
                  Speelduur (minuten)
                </label>
                <input
                  id="playingTimeMinutes"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  className="input"
                  aria-invalid={!!errors.playingTimeMinutes}
                  aria-describedby={
                    errors.playingTimeMinutes ? 'playingTimeMinutes-error' : undefined
                  }
                  {...register('playingTimeMinutes', { valueAsNumber: true })}
                />
                {errors.playingTimeMinutes && (
                  <div id="playingTimeMinutes-error" className="field__error">
                    {errors.playingTimeMinutes.message}
                  </div>
                )}
              </div>
            </div>

            <div className="field-row field-row--equal">
              <div className="field">
                <label htmlFor="minPlayers" className="field__label">
                  Min. spelers
                </label>
                <input
                  id="minPlayers"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  className="input"
                  aria-invalid={!!errors.minPlayers}
                  aria-describedby={errors.minPlayers ? 'minPlayers-error' : undefined}
                  {...register('minPlayers', { valueAsNumber: true })}
                />
                {errors.minPlayers && (
                  <div id="minPlayers-error" className="field__error">
                    {errors.minPlayers.message}
                  </div>
                )}
              </div>
              <div className="field">
                <label htmlFor="maxPlayers" className="field__label">
                  Max. spelers
                </label>
                <input
                  id="maxPlayers"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  className="input"
                  aria-invalid={!!errors.maxPlayers}
                  aria-describedby={errors.maxPlayers ? 'maxPlayers-error' : undefined}
                  {...register('maxPlayers', { valueAsNumber: true })}
                />
                {errors.maxPlayers && (
                  <div id="maxPlayers-error" className="field__error">
                    {errors.maxPlayers.message}
                  </div>
                )}
              </div>
            </div>

            <div className="field">
              <label htmlFor="boxImage" className="field__label">
                Foto van de doos (optioneel)
              </label>
              <input
                id="boxImage"
                type="file"
                accept="image/*"
                className="input"
                aria-invalid={!!imageError}
                aria-describedby={imageError ? 'boxImage-error' : undefined}
                onChange={handleImageChange}
              />
              {imageError && (
                <div id="boxImage-error" className="field__error">
                  {imageError}
                </div>
              )}
              {boxImageUrl && (
                <img
                  src={boxImageUrl}
                  alt="Voorbeeld van de foto"
                  className="add-game-page__preview"
                />
              )}
            </div>

            <div className="cluster">
              <button
                type="submit"
                className="btn btn--primary"
                disabled={isSubmitting || !!duplicate}
              >
                {isSubmitting ? 'Bezig met toevoegen…' : 'Toevoegen'}
              </button>
              <Link to="/catalogue" className="btn btn--outline-secondary">
                Annuleren
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
