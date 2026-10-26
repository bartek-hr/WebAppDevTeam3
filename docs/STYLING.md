# Styling in GameShelf (zonder Bootstrap)

We mogen geen CSS-framework gebruiken (geen Bootstrap, react-bootstrap of react-bootstrap-icons).
Alle opmaak is gewone CSS die we zelf schrijven. Dit document legt uit waar alles staat en hoe je
het gebruikt.

## Waar staat de CSS?

| Bestand                         | Wat staat erin                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| `src/styles/tokens.css`         | Variabelen: kleuren, ruimte, randen, schaduwen. Gebruik altijd `var(--…)`.         |
| `src/styles/base.css`           | Stijl van HTML-elementen zelf (`body`, koppen, links, tabellen, focus).            |
| `src/styles/layout.css`         | Paginalayout: `.container`, `.page-header`, `.card-grid`, `.filter-bar`, …         |
| `src/styles/components.css`     | Gedeelde onderdelen: knoppen, formulieren, badges, meldingen, kaarten, tabel, …    |
| `src/styles/utilities.css`      | Een paar hulpclasses voor tekst (`.text-muted`, `.visually-hidden`, …).            |
| `src/index.css`                 | Importeert de bestanden hierboven in de goede volgorde.                            |
| `<Component>.css` naast een TSX | Stijl die alleen bij dat ene component hoort, bijv. `components/GameCard.css`.     |

Afspraken:

- **Classnamen volgen BEM**: `.blok`, `.blok__onderdeel`, `.blok--variant`. Bijvoorbeeld
  `.card`, `.card__body`, `.btn--primary`.
- **Geen losse kleuren of maten**: gebruik de variabelen uit `tokens.css` (`var(--color-primary)`,
  `var(--space-3)`, …). Mist er een? Voeg hem toe aan `tokens.css`.
- **Stijl voor één component** zet je in een eigen bestand naast het component en importeer je
  bovenaan: `import './GameCard.css'`. Begin de classnamen met de naam van het component
  (`.game-card__badges`), dan botsen ze niet met andere bestanden.
- **Geen inline `style={{…}}`** behalve voor waarden die uit JavaScript komen (bijv. een hoogte
  uit een prop).
- **Breekpunten**: 576px, 768px, 992px en 1200px (mobile first: `@media (min-width: …)`).

## React-componenten

| Component                       | Gebruik                                                                     |
| ------------------------------- | --------------------------------------------------------------------------- |
| `components/Alert.tsx`          | `<Alert variant="danger">…</Alert>`, met `onClose` voor een sluitknop.      |
| `components/Modal.tsx`          | Dialoogvenster op basis van `<dialog>` (zie voorbeeld hieronder).           |
| `components/IconButton.tsx`     | Knop met alleen een icoon en een CSS-tooltip.                               |
| `components/NavMenu.tsx`        | Uitklapmenu in de navigatiebalk.                                            |
| `components/PageSpinner.tsx`    | Laadindicator midden op de pagina.                                          |
| `components/icons.tsx`          | Iconen als SVG: `<PlusIcon />`, `<TrashIcon />`, `<EditIcon />`, …         |

`Alert`-varianten: `danger`, `warning`, `info`, `success`, `neutral` (wit vak met rand, voor
"nog leeg" of "niets gevonden"). `danger` en `warning` krijgen `role="alert"`, de rest
`role="status"`.

Iconen zijn standaard even groot als de tekst en hebben `aria-hidden`. Andere maat:
`<BoxIcon size={48} />`. In een `.btn` of `.badge` komt er vanzelf ruimte tussen icoon en tekst.

## Veelgebruikte classes

**Knoppen** (werkt op `<button>` én op `<Link>`):

```tsx
<button type="button" className="btn btn--primary">Opslaan</button>
<Link to="/catalogue" className="btn btn--outline-secondary">Annuleren</Link>
```

Varianten: `btn--primary`, `btn--secondary`, `btn--danger`, `btn--outline-primary`,
`btn--outline-secondary`, `btn--outline-success`, `btn--outline-danger`, `btn--link`.
Maten en vormen: `btn--sm`, `btn--icon` (vierkant), `btn--block` (volle breedte).

**Formulierveld**: label, invoer en foutmelding. Zet `aria-invalid` op de invoer als er een fout
is; daar hangt de rode rand aan en een schermlezer hoort het ook.

```tsx
<div className="field">
  <label htmlFor="title" className="field__label">Titel</label>
  <input
    id="title"
    className="input"
    aria-invalid={!!errors.title}
    aria-describedby={errors.title ? 'title-error' : undefined}
    {...register('title')}
  />
  {errors.title && <div id="title-error" className="field__error">{errors.title.message}</div>}
  <small className="field__hint">Hulptekst onder het veld</small>
</div>
```

`.input` werkt voor `<input>`, `<select>` (met eigen pijltje) en `<textarea>`.
Velden naast elkaar: `<div className="field-row">` (2 : 1) of `field-row field-row--equal` (1 : 1).
Aan/uit-schakelaar:

```tsx
<div className="switch">
  <input type="checkbox" role="switch" id="shelf-public" className="switch__input" {...register('isPublic')} />
  <label htmlFor="shelf-public" className="switch__label">Openbaar</label>
</div>
```

**Dialoogvenster**:

```tsx
<Modal title="Plank verwijderen" onClose={onClose}>
  <form onSubmit={…}>
    <div className="modal__body">…</div>
    <div className="modal__footer">
      <button type="button" className="btn btn--secondary" onClick={onClose}>Annuleren</button>
      <button type="submit" className="btn btn--primary">Opslaan</button>
    </div>
  </form>
</Modal>
```

Focus bij openen in een bepaald veld? Geef dat veld `data-autofocus` (niet `autoFocus`).

**Layout**:

| Class                        | Wat het doet                                                        |
| ---------------------------- | ------------------------------------------------------------------- |
| `.page-header`               | Paginatitel links, knoppen rechts.                                  |
| `.cluster`                   | Dingen naast elkaar met ruimte ertussen (bijv. een rij knoppen).    |
| `.card-grid`                 | Raster van kaarten: 1 → 2 → 3 → 4 kolommen.                         |
| `.card-grid--wide`           | Bredere kaarten: 1 → 2 → 3 kolommen.                                |
| `.filter-bar`                | Zoekveld (`.filter-bar__search`) en filters naast elkaar.           |
| `.page-narrow`               | Smalle, gecentreerde pagina (bijv. een formulier).                  |
| `.detail-layout`             | Afbeelding links (1/3), gegevens rechts (2/3).                      |
| `.details-list`              | `<dl>` met naam en waarde naast elkaar.                             |

**Overige onderdelen**: `.card` (+ `__body`, `__title`, `__subtitle`, `__text`, `__img`,
`__footer`, `__link`, `__actions`), `.badge` (+ `--primary`, `--secondary`, `--success`,
`--warning`, `--danger`, `--outline`), `.table` (+ `--hover`, in een `.table-scroll`),
`.breadcrumb`, `.spinner`, `data-tooltip="…"`.

**Hulpclasses**: `.visually-hidden`, `.text-muted`, `.text-small`, `.text-warning`, `.text-end`,
`.text-center`, `.nowrap`. Voor marges zijn er bewust géén hulpclasses: geef het component een
eigen class in zijn eigen CSS-bestand.

## Van Bootstrap naar onze CSS

Handig als je code van een oudere branch overzet.

| Bootstrap / react-bootstrap                  | Nu                                                              |
| -------------------------------------------- | --------------------------------------------------------------- |
| `<Button variant="primary">`                 | `<button type="button" className="btn btn--primary">`           |
| `<Button variant="link">`                    | `<button type="button" className="btn btn--link">`              |
| `className="btn btn-outline-secondary"`      | `className="btn btn--outline-secondary"`                        |
| `<Alert variant="danger">`                   | `<Alert variant="danger">` uit `components/Alert`               |
| `<Alert variant="light" className="border">` | `<Alert variant="neutral">`                                     |
| `<Badge bg="success">`                       | `<span className="badge badge--success">`                       |
| `<Badge bg="light" text="dark" className="border">` | `<span className="badge badge--outline">`                |
| `<Card>` / `<Card.Body>` / `<Card.Title>`    | `<div className="card">` / `card__body` / `card__title`         |
| `<Form.Group>` + `<Form.Label>`              | `<div className="field">` + `<label className="field__label">`  |
| `<Form.Control>` / `<Form.Select>`           | `<input className="input">` / `<select className="input">`      |
| `<Form.Control as="textarea">`               | `<textarea className="input">`                                  |
| `isInvalid` + `<Form.Control.Feedback>`      | `aria-invalid` + `<div className="field__error">`               |
| `<Form.Text>`                                | `<small className="field__hint">`                               |
| `<Form.Check type="switch">`                 | `.switch` (zie hierboven)                                       |
| `<InputGroup>`                               | `<div className="input-group">`                                 |
| `<Modal>` + `Modal.Header/Body/Footer`       | `<Modal title onClose>` + `modal__body` / `modal__footer`       |
| `<Table responsive hover>`                   | `<div className="table-scroll"><table className="table table--hover">` |
| `<Row xs={1} sm={2} md={3} lg={4}>` + `<Col>` | `<div className="card-grid">` (geen `Col` nodig)               |
| `<Breadcrumb>`                               | `<nav aria-label="Kruimelpad"><ol className="breadcrumb">`      |
| `<Spinner>`                                  | `<PageSpinner />` of `<div className="spinner" role="status">`  |
| `OverlayTrigger` + `Tooltip`                 | `data-tooltip="…"` (of `IconButton`)                            |
| `react-bootstrap-icons`                      | `components/icons.tsx` (bijv. `PlusLg` → `PlusIcon`)            |
| `d-flex gap-2`                               | `.cluster`                                                      |
| `text-body-secondary`                        | `.text-muted`                                                   |
| `small`                                      | `.text-small`                                                   |
| `mb-3`, `mt-2`, `me-1`, …                    | eigen class met marge in het CSS-bestand van het component      |
