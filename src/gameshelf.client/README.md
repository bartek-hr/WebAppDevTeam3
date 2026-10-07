# gameshelf.client

React + TypeScript frontend van GameShelf (Vite). Zie de [README in de root](../../README.md) voor
het starten van het project en [docs/TAAKVERDELING.md](../../docs/TAAKVERDELING.md) voor wie wat bouwt.

```
src/
├── api/                 axios-instantie (baseURL /api) en getErrorMessage()
├── components/          gedeelde componenten: Layout, GameCard, GamePicker, BoxImage, PageSpinner
├── features/<onderdeel> pagina's, api.ts (React Query hooks) en mocks.ts (MSW) per onderdeel
├── mocks/               MSW-setup, verzamelt de handlers van alle features
├── test/                testsetup (MSW in Node) en renderRoutes()/loginAs() voor tests
├── types/index.ts       domeintypes volgens de casus
└── routes.tsx           alle routes (alles behalve /login en /register vraagt om inloggen)
```

## Inloggen in mockmodus

Alle pagina's vragen om inloggen. Met `VITE_USE_MOCKS=true` log je in met een mocklid uit
`features/auth/mocks.ts` (bijv. `daan`, of `sanne` voor het bestuur), en dan werkt elk wachtwoord. Op de
inlogpagina kun je met één klik inloggen, en via het gebruikersmenu rechtsboven wissel je van lid.

## Handig voor je eigen feature

- **Wie is ingelogd:** `const { member, isCommittee } = useAuth()` (uit `features/auth/useAuth`)
- **Leden tonen:** `useMembers()` / `useMember(id)` uit `features/auth/api`
- **Een game kiezen:** `<GamePicker>` uit `components/GamePicker` (voorbeeld met react-hook-form in
  het commentaar bovenaan)
- **Een game tonen:** `<GameCard game={game} to=... />`, met eventueel knoppen als children
- **In je mocks:** `getCurrentMember(request)` uit `features/auth/mocks` geeft het lid dat het verzoek
  doet, en `games` uit `features/catalogue/mocks` geeft de mockgames (gebruik hun id's)
- **Foutmeldingen:** `getErrorMessage(error)` uit `api/errors`
- **Tests:** `renderRoutes([...], '/pad')` en `loginAs('m2')` uit `test/utils` (zie de bestaande tests)
