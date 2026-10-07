import { useId, useState, type KeyboardEvent } from 'react'
import { Button, Form, InputGroup, ListGroup } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useGames } from '../features/catalogue/api'
import type { Game } from '../types'
import { formatEdition } from '../utils/format'

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

  if (isLoading) return <Form.Control id={inputId} disabled placeholder="Games laden…" />
  if (isError || !games) {
    return (
      <Form.Control
        id={inputId}
        disabled
        isInvalid
        placeholder="Games konden niet geladen worden"
      />
    )
  }

  const selected = value != null ? games.find((game) => game.id === value) : undefined
  if (selected) {
    return (
      <>
        <InputGroup hasValidation>
          <Form.Control
            id={inputId}
            readOnly
            value={`${selected.title} (${formatEdition(selected)})`}
            isInvalid={!!error}
            disabled={disabled}
          />
          <Button
            variant="outline-secondary"
            disabled={disabled}
            onClick={() => {
              onChange(null)
              setFocusSearch(true)
            }}
          >
            Wijzigen
          </Button>
        </InputGroup>
        {error && <div className="invalid-feedback d-block">{error}</div>}
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
    <div className="position-relative">
      <Form.Control
        id={inputId}
        type="search"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={isOpen && activeGame ? `${listId}-${activeGame.id}` : undefined}
        autoComplete="off"
        autoFocus={focusSearch}
        placeholder={placeholder}
        value={query}
        isInvalid={!!error}
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
        <ListGroup
          id={listId}
          role="listbox"
          className="position-absolute w-100 mt-1 shadow"
          style={{ zIndex: 1050, maxHeight: 320, overflowY: 'auto' }}
        >
          {results.length === 0 ? (
            <ListGroup.Item className="small text-body-secondary">
              Geen games gevonden
            </ListGroup.Item>
          ) : (
            results.map((game) => (
              <ListGroup.Item
                key={game.id}
                id={`${listId}-${game.id}`}
                as="button"
                type="button"
                role="option"
                action
                active={game === activeGame}
                aria-selected={game === activeGame}
                // Voorkomt dat het zoekveld de focus (en de lijst) verliest vóór de klik
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(game)}
              >
                <div className="fw-semibold">{game.title}</div>
                <div className="small">{formatEdition(game)}</div>
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      )}
      {error && <div className="invalid-feedback d-block">{error}</div>}
      <Form.Text>
        Staat de game er niet tussen? <Link to="/catalogue/new">Voeg hem toe aan de catalogus</Link>
        .
      </Form.Text>
    </div>
  )
}
