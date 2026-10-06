# Taakverdeling frontend — eerste tussenpresentatie

**Doel:** een doorklikbare React-frontend voor alle vijf onderdelen van de casus (catalogus, collecties,
uitlenen, spelavonden, verlanglijsten/ruilen). De backend is nog niet nodig: alle data komt uit
nep-endpoints (MSW, `VITE_USE_MOCKS=true` in `.env.development`). Later vervangen we alleen de mocks
door de echte ASP.NET API; de componenten blijven hetzelfde.

## Overzicht

| Wie         | Onderdeel                               | Mappen in `src/gameshelf.client/src/features/` | Routes                                                                  |
| ----------- | --------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------- |
| **Floris**  | Fundament, accounts & catalogus         | `auth/`, `home/`, `catalogue/` + `components/` | `/login`, `/register`, `/`, `/catalogue`, `/catalogue/new`, `/catalogue/:id` |
| **Joran**   | Collecties & planken                    | `collection/`, `shelves/`                      | `/collection`, `/members/:id`, `/shelves`, `/shelves/:id`               |
| **Rayell**  | Uitlenen & biedingen (ruilen)           | `lending/`, `trading/`                         | `/lending`, `/lending/mine`, `/offers`                                  |
| **Bartosz** | Spelavonden & verlanglijsten            | `sessions/`, `wishlist/`                       | `/sessions`, `/sessions/new`, `/sessions/:id`, `/sessions/:id/edit`, `/wishlists`, `/wishlists/mine` |

Iedereen heeft ongeveer zes schermen. De lege pagina's en routes bestaan al, dus je kunt meteen
beginnen in je eigen map.

## Afspraken

- **Eigen map = eigen terrein.** Werk zoveel mogelijk binnen je eigen `features/<onderdeel>/`.
  Gedeelde bestanden (`types/index.ts`, `components/`, `routes.tsx`, `mocks/handlers.ts`) pas je
  aan in een kleine, aparte PR en je meldt het even in de groepschat.
- **Patroon per feature** (voorbeeld: `features/catalogue/`):
  - `api.ts` bevat de React Query hooks (`useGames`, `useCreateGame`, …) die via `api/client.ts` praten.
  - `mocks.ts` bevat de nep-endpoints en nep-data van jouw onderdeel.
  - `XxxPage.tsx` bevat de pagina's, en kleinere componenten zet je ernaast in dezelfde map.
- **Types** staan in `src/types/index.ts` en volgen de casus. Wijzig je een type, zeg het dan,
  want de backend gaat dezelfde vorm gebruiken.
- **UI:** alleen `react-bootstrap` en `react-bootstrap-icons`, geen losse CSS-frameworks.
  Teksten in de UI zijn Nederlands, code (namen, variabelen) is Engels.
- **Formulieren:** `react-hook-form` met een `zod`-schema voor validatie.
- **Datums:** `date-fns` (bijv. "nog 3 dagen geldig", "te laat sinds …").
- **Regels uit de casus:** de backend bewaakt ze straks, de frontend laat ze zien (knop uitschakelen,
  melding tonen). Afgeleide waarden zoals `isLate`, `isValid` en "past de game?" komen als veld uit
  de API. In je mocks reken je ze zelf uit, en niemand zet ze met de hand.
- **Git:** `dev` is de werkbranch. Per taak (GitHub-issue) maak je een branch vanaf `dev`
  (`feature/<naam>-<onderwerp>`, bijv. `feature/joran-shelves`) en open je een PR naar `dev`, met
  minimaal één reviewer uit het team. Zet `Closes #<issuenummer>` in de PR. Niet direct op `dev` of
  `main` pushen. `dev` gaat naar `main` als er een stabiele versie is (bijv. voor een presentatie).
- **Definition of done:** de pagina werkt met mockdata, is bruikbaar op telefoonbreedte,
  `npm run build` en `npm run lint` slagen, en de PR is gereviewd.

## Taken per persoon

### Floris — Fundament, accounts & catalogus

Week 1 eerst, want de anderen hebben dit nodig:

- [ ] Mockdata voor leden (`features/auth/mocks.ts`): een paar leden, waarvan één in het bestuur
- [ ] `useAuth()` / AuthContext: het ingelogde lid, `isCommittee`, `login`, `logout`
      (voorlopig met een mock-gebruiker, zodat iedereen "mijn" en "van een ander" kan testen)
- [ ] `ProtectedRoute`: wie niet is ingelogd gaat naar `/login`
- [ ] Gedeeld component `GamePicker`: een game uit de catalogus zoeken en kiezen. Dit component
      wordt gebruikt bij collectie, uitlenen, spelavonden, verlanglijst en biedingen.
- [ ] Gedeeld component `GameCard` / `GameSummary` (doosfoto, titel, editie, spelers, speelduur)

Accounts & catalogus:

- [ ] Inloggen en registreren (react-hook-form + zod), en in de navbar het ingelogde lid plus uitloggen
- [ ] Catalogus: overzicht met doosfoto, zoeken op titel, filteren op categorie en aantal spelers
- [ ] Game-detail: alle velden. Elke editie is een eigen game (NL- en EN-doos zijn twee games).
- [ ] Game toevoegen: titel, uitgever, jaar, categorie, min/max spelers (min ≤ max), speelduur,
      optioneel een foto van de doos
- [ ] Home-dashboard: komende spelavonden, mijn leningen die terug moeten, nieuwe biedingen
      (gebruikt de hooks van de anderen, dus dit komt aan het eind)

### Joran — Collecties & planken

- [ ] Mockdata: collectie-records en planken (`collection/mocks.ts`, `shelves/mocks.ts`)
- [ ] Collectie: tabel met game, status, aantal keer gespeeld, beoordeling en notitie, met filter op status
- [ ] Game toevoegen aan de collectie (`GamePicker`) en verwijderen. Bij verwijderen verdwijnt de game
      ook van alle planken (laat dat zien in de bevestiging).
- [ ] Record bewerken: status, knop "+1 gespeeld" (het aantal gaat alleen omhoog en de eerste keer
      zet de status op *gespeeld*) en notitie (missende tokens, huisregels, uitbreiding in de doos)
- [ ] Beoordeling kan alleen bij status *gespeeld*, anders is het veld uitgeschakeld met uitleg
- [ ] Maximaal 3 records *bezig* (campagnes). Bij de 4e is de optie uitgeschakeld en staat er een melding.
- [ ] Planken: eigen planken tonen, aanmaken, bewerken en verwijderen (naam, beschrijving, openbaar ja/nee)
- [ ] Plank-detail: games op de plank, games uit je eigen collectie toevoegen en weghalen
- [ ] Profiel van een lid (`/members/:id`): alleen de openbare planken van dat lid, met een link
      naar hun verlanglijst

### Rayell — Uitlenen & biedingen

Uitlenen:

- [ ] Mockdata: dozen, aanvragen en leningen (`lending/mocks.ts`), met minstens één lening die te laat is
- [ ] Uitleenlijst: alle aangeboden dozen met game, eigenaar, staat en beschikbaar/uitgeleend, met filter
- [ ] "Doos aanbieden": `GamePicker` plus een beschrijving van de staat (hoeft niet in je collectie te staan)
- [ ] Doos aanvragen: de aanvraag krijgt status *in afwachting*
- [ ] Mijn uitleningen, met tabbladen:
  - *Mijn dozen*: binnengekomen aanvragen goedkeuren of afwijzen. Goedkeuren wijst de andere
    aanvragen op dezelfde doos af. Alleen de eigenaar ziet deze knoppen.
  - *Mijn aanvragen*: de status van wat ik heb aangevraagd
  - *Leningen*: de terugbrengdatum, het label *te laat* (afgeleid, niet handmatig), één keer
    verlengen (alleen als de lening nog niet te laat is en binnen de maximale uitleentermijn) en
    terugbrengen registreren (door de eigenaar of het bestuur)
- [ ] Lening starten: een terugbrengdatum kiezen, begrensd door de maximale uitleentermijn
- [ ] Bestuursweergave: alle lopende leningen, de te late bovenaan, waar het bestuur het
      terugbrengen kan registreren

Biedingen (ruilen):

- [ ] Mockdata: biedingen (`trading/mocks.ts`), met minstens één bieding die verlopen is
- [ ] Component `MakeOfferModal`: op een verlanglijst-item een bod doen en de game kiezen die je
      ervoor terugvraagt (`GamePicker`). Bartosz gebruikt dit component op de verlanglijstpagina.
- [ ] Mijn biedingen:
  - *Ontvangen* (op mijn verlanglijst-items): accepteren of afwijzen. Een bod dat niet meer geldig
    is kan niet geaccepteerd worden.
  - *Verstuurd*: annuleren zolang het bod open is
  - statuslabels (open, geaccepteerd, afgewezen, geannuleerd) en "nog X dagen geldig"

### Bartosz — Spelavonden & verlanglijsten

Spelavonden:

- [ ] Mockdata: spelavonden en aanmeldingen (`sessions/mocks.ts`), met minstens één volle avond met
      wachtlijst (12 aanmeldingen voor 5 plekken)
- [ ] Overzicht: komende avonden met datum, plek en bezetting (bijv. 5/5 + 7 wachtend).
      Geannuleerde avonden zijn duidelijk gemarkeerd.
- [ ] Formulier plannen/bewerken: titel, datum en tijd, plek (clubruimte of thuis), aantal plekken
- [ ] Detail: bevestigde spelers, wachtlijst in volgorde van aanmelden, aanmelden en afmelden
- [ ] Bij het aanmelden een game meenemen (`GamePicker`) met het label "genoeg spelers / te weinig
      spelers", afgeleid uit het aantal bevestigde plekken en het minimum aantal spelers van de game
- [ ] Acties voor de host:
  - plekken verlagen, met een waarschuwing welke laatst bevestigde spelers terug naar de wachtlijst gaan
  - hosting overdragen, alleen aan een lid met een bevestigde plek
  - annuleren (de host of het bestuur)
- [ ] Alleen de host ziet de bewerk-knoppen. Het bestuur ziet daarnaast "annuleren".

Verlanglijsten:

- [ ] Mockdata: verlanglijst-items (`wishlist/mocks.ts`)
- [ ] Mijn verlanglijst: items toevoegen (`GamePicker`, prioriteit, notitie over editie en
      acceptabele staat), bewerken en verwijderen, met het label *vervuld*
- [ ] Alle verlanglijsten: items van alle leden doorzoeken (filter op game of lid), met de knop
      "Bod doen" die Rayells `MakeOfferModal` opent. Een vervuld item neemt geen biedingen meer aan.

## Afhankelijkheden

| Wat                                | Van     | Gebruikt door              | Tot het klaar is                                  |
| ---------------------------------- | ------- | -------------------------- | ------------------------------------------------- |
| `useAuth()` met mock-gebruiker     | Floris  | iedereen                   | tijdelijk een vaste `currentMemberId` in je mocks |
| `GamePicker`                       | Floris  | Joran, Rayell, Bartosz     | tijdelijk een simpele `<Form.Select>` met games   |
| `games` mockdata                   | Floris  | iedereen                   | staat al in `features/catalogue/mocks.ts`         |
| `MakeOfferModal`                   | Rayell  | Bartosz (verlanglijsten)   | een knop zonder actie                             |
| Link naar verlanglijst van een lid | Bartosz | Joran (profielpagina)      | de link naar `/wishlists?member=<id>`             |
| Hooks voor het dashboard           | iedereen| Floris (home)              | Floris bouwt het dashboard als laatste            |

## Planning

Vul de data in zodra de datum van de tussenpresentatie bekend is.

1. **Fase 1, fundament (week 1):** Floris levert `useAuth`, `GamePicker` en de mockleden. Iedereen zet
   de mockdata van zijn onderdeel neer en bouwt de overzichtspagina's (alleen lezen).
2. **Fase 2, interactie (week 2):** formulieren, knoppen en de regels uit de casus (uitgeschakelde
   knoppen, meldingen, afgeleide labels).
3. **Fase 3, afwerking (laatste week):** de onderdelen aan elkaar koppelen (dashboard, `MakeOfferModal`,
   profiel → verlanglijst), testen op telefoonbreedte en het demoscript oefenen.

## Demoscript tussenpresentatie (voorstel)

Laat per onderdeel een verhaal uit de casus zien:

1. **Floris:** inloggen en een game zoeken. De Nederlandse en de Engelse editie van dezelfde titel
   zijn twee aparte games. Een ontbrekende game toevoegen.
2. **Joran:** een campagnegame beoordelen lukt pas na de eerste keer spelen, en een 4e campagne
   starten wordt geweigerd. Een privé-plank is niet te zien op het profiel van een ander.
3. **Rayell:** de doos die "sinds 2019 bij een neef ligt" staat als *te laat*, en verlengen kan
   niet meer. Een aanvraag goedkeuren wijst de andere aanvragen automatisch af.
4. **Bartosz:** 12 leden melden zich aan voor een tafel van 5, en de wachtlijst loopt. De host
   verlaagt de plekken, waarna de laatst bevestigden terug naar de wachtlijst gaan. Daarna een bod
   doen op een verlanglijst-item.
