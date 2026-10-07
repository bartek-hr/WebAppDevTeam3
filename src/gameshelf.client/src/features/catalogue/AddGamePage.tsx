import { zodResolver } from '@hookform/resolvers/zod'
import { useState, type ChangeEvent } from 'react'
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../../api/errors'
import { formatEdition } from '../../utils/format'
import { useCreateGame, useGames } from './api'
import { findDuplicate, findEditions, gameSchema, type NewGame } from './gameSchema'

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
    <Row className="justify-content-center">
      <Col lg={8}>
        <h1>Game toevoegen</h1>
        <p className="text-body-secondary">
          Mist er een game in de catalogus? Voeg hem toe, dan kan iedereen hem gebruiken in hun
          collectie, uitleenlijst en verlanglijst.
        </p>

        {createGame.isError && <Alert variant="danger">{getErrorMessage(createGame.error)}</Alert>}

        <Card className="shadow-sm">
          <Card.Body>
            <Form noValidate onSubmit={handleSubmit(onSubmit)}>
              <Form.Group className="mb-3" controlId="title">
                <Form.Label>Titel</Form.Label>
                <Form.Control autoFocus isInvalid={!!errors.title} {...register('title')} />
                <Form.Control.Feedback type="invalid">
                  {errors.title?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Row>
                <Form.Group as={Col} sm={8} className="mb-3" controlId="publisher">
                  <Form.Label>Uitgever</Form.Label>
                  <Form.Control isInvalid={!!errors.publisher} {...register('publisher')} />
                  <Form.Control.Feedback type="invalid">
                    {errors.publisher?.message}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} sm={4} className="mb-3" controlId="releaseYear">
                  <Form.Label>Jaar van uitgave</Form.Label>
                  <Form.Control
                    type="number"
                    inputMode="numeric"
                    isInvalid={!!errors.releaseYear}
                    {...register('releaseYear', { valueAsNumber: true })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.releaseYear?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>

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

              <Row>
                <Form.Group as={Col} sm={8} className="mb-3" controlId="category">
                  <Form.Label>Categorie</Form.Label>
                  <Form.Control
                    list="category-options"
                    isInvalid={!!errors.category}
                    {...register('category')}
                  />
                  <datalist id="category-options">
                    {categories.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                  <Form.Control.Feedback type="invalid">
                    {errors.category?.message}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} sm={4} className="mb-3" controlId="playingTimeMinutes">
                  <Form.Label>Speelduur (minuten)</Form.Label>
                  <Form.Control
                    type="number"
                    inputMode="numeric"
                    min={1}
                    isInvalid={!!errors.playingTimeMinutes}
                    {...register('playingTimeMinutes', { valueAsNumber: true })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.playingTimeMinutes?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>

              <Row>
                <Form.Group as={Col} xs={6} className="mb-3" controlId="minPlayers">
                  <Form.Label>Min. spelers</Form.Label>
                  <Form.Control
                    type="number"
                    inputMode="numeric"
                    min={1}
                    isInvalid={!!errors.minPlayers}
                    {...register('minPlayers', { valueAsNumber: true })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.minPlayers?.message}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} xs={6} className="mb-3" controlId="maxPlayers">
                  <Form.Label>Max. spelers</Form.Label>
                  <Form.Control
                    type="number"
                    inputMode="numeric"
                    min={1}
                    isInvalid={!!errors.maxPlayers}
                    {...register('maxPlayers', { valueAsNumber: true })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.maxPlayers?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>

              <Form.Group className="mb-3" controlId="boxImage">
                <Form.Label>Foto van de doos (optioneel)</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  isInvalid={!!imageError}
                  onChange={handleImageChange}
                />
                <Form.Control.Feedback type="invalid">{imageError}</Form.Control.Feedback>
                {boxImageUrl && (
                  <img
                    src={boxImageUrl}
                    alt="Voorbeeld van de foto"
                    className="mt-2 rounded border"
                    style={{ maxHeight: 160 }}
                  />
                )}
              </Form.Group>

              <div className="d-flex gap-2">
                <Button type="submit" disabled={isSubmitting || !!duplicate}>
                  {isSubmitting ? 'Bezig met toevoegen…' : 'Toevoegen'}
                </Button>
                <Link to="/catalogue" className="btn btn-outline-secondary">
                  Annuleren
                </Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}
