import { useId, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { useGames } from '../features/catalogue/api'
import type { Game } from '../types'
import { formatEdition } from '../utils/format'
import './GamePicker.css'

interface GamePickerProps {
  value?: number | null
  onChange: (gameId: number | null) => void
  onBlur?: () => void
  // Games die niet gekozen mogen worden, bijv. games die al in je collectie staan
  excludeIds?: number[]
  // Foutmelding uit het formulier (maakt het veld ook rood)
  error?: string
  disabled?: boolean
  id?: string
  placeholder?: string
}

const MAX_RESULTS = 8

/**
 * Kies een game uit de catalogus. Zoekt op titel en uitgever, en toont per game de editie
 * (uitgever en jaar), zodat je de NL- en EN-doos van dezelfde titel uit elkaar houdt.
 *
 * Gebruik in een react-hook-form-formulier (veld `gameId: number`):
 *
 *   <Controller
 *     name="gameId"
 *     control={control}
 *     render={({ field, fieldState }) => (
 *       <GamePicker
 *         value={field.value}
 *         onChange={field.onChange}
 *         onBlur={field.onBlur}
 *         error={fieldState.error?.message}
 *       />
 *     )}
 *   />
 */
export default function GamePicker({
  value,
  onChange,
  onBlur,
  excludeIds = [],
  error,
  disabled,
  id,
  placeholder = 'Zoek een game op titel of uitgever…',
}: GamePickerProps) {
  const { data: games, isLoading, isError } = useGames()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  // Na "Wijzigen" de focus meteen in het zoekveld zetten
  const [focusSearch, setFocusSearch] = useState(false)
  const generatedId = useId()
  const inputId = id ?? generatedId
  const listId = `${inputId}-options`
  const errorId = `${inputId}-error`

  if (isLoading) {
    return <input id={inputId} className="input" disabled placeholder="Games laden…" />
  }
  if (isError || !games) {
    return (
      <input
        id={inputId}
        className="input"
        disabled
        aria-invalid
        placeholder="Games konden niet geladen worden"
      />
    )
  }

  const selected = value != null ? games.find((game) => game.id === value) : undefined
  if (selected) {
    return (
      <>
        <div className="input-group">
          <input
            id={inputId}
            className="input"
            readOnly
            value={`${selected.title} (${formatEdition(selected)})`}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            disabled={disabled}
          />
          <button
            type="button"
            className="btn btn--outline-secondary"
            disabled={disabled}
            onClick={() => {
              onChange(null)
              setFocusSearch(true)
            }}
          >
            Wijzigen
          </button>
        </div>
        {error && (
          <div id={errorId} className="field__error">
            {error}
          </div>
        )}
      </>
    )
  }

  const search = query.trim().toLowerCase()
  const results = games
    .filter((game) => !excludeIds.includes(game.id))
    .filter(
      (game) =>
        !search ||
        game.title.toLowerCase().includes(search) ||
        game.publisher.toLowerCase().includes(search),
    )
    .sort((a, b) => a.title.localeCompare(b.title, 'nl') || a.releaseYear - b.releaseYear)
    .slice(0, MAX_RESULTS)
  const activeGame = results[Math.min(activeIndex, results.length - 1)]

  function select(game: Game) {
    onChange(game.id)
    setQuery('')
    setIsOpen(false)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((index) => Math.min(index + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter' && isOpen && activeGame) {
      // Enter kiest een game en verstuurt niet het formulier
      event.preventDefault()
      select(activeGame)
    } else if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    // Eigen key: na "Wijzigen" komt er een nieuw zoekveld (React hergebruikt anders de <div>
    // en <input> van de gekozen game), zodat autoFocus werkt
    <div key="search" className="game-picker">
      <input
        id={inputId}
        className="input"
        type="search"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={isOpen && activeGame ? `${listId}-${activeGame.id}` : undefined}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        autoComplete="off"
        autoFocus={focusSearch}
        placeholder={placeholder}
        value={query}
        disabled={disabled}
        onChange={(event) => {
          setQuery(event.target.value)
          setActiveIndex(0)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          setIsOpen(false)
          onBlur?.()
        }}
        onKeyDown={handleKeyDown}
      />
      {isOpen && (
        // Lijst en opties zijn geen tabstop: de focus blijft in het zoekveld (kiezen gaat met
        // de pijltjes). Anders springt Tab naar de lijst, die dan meteen verdwijnt, en raak je
        // de focus kwijt.
        <div id={listId} role="listbox" className="game-picker__list" tabIndex={-1}>
          {results.length === 0 ? (
            <div className="game-picker__empty">Geen games gevonden</div>
          ) : (
            results.map((game) => (
              <button
                key={game.id}
                id={`${listId}-${game.id}`}
                type="button"
                role="option"
                className="game-picker__option"
                aria-selected={game === activeGame}
                tabIndex={-1}
                // Voorkomt dat het zoekveld de focus (en de lijst) verliest vóór de klik
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(game)}
              >
                <span className="game-picker__title">{game.title}</span>{' '}
                <span className="game-picker__edition">{formatEdition(game)}</span>
              </button>
            ))
          )}
        </div>
      )}
      {error && (
        <div id={errorId} className="field__error">
          {error}
        </div>
      )}
      <small className="field__hint">
        Staat de game er niet tussen? <Link to="/catalogue/new">Voeg hem toe aan de catalogus</Link>
        .
      </small>
    </div>
  )
}
