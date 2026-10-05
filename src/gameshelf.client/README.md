# gameshelf.client

React + TypeScript frontend van GameShelf (Vite). Zie de [README in de root](../../README.md) voor
het starten van het project en [docs/TAAKVERDELING.md](../../docs/TAAKVERDELING.md) voor wie wat bouwt.

```
src/
├── api/client.ts        gedeelde axios-instantie (baseURL /api)
├── components/          gedeelde componenten (Layout, GamePicker, ...)
├── features/<onderdeel> pagina's, api.ts (React Query hooks) en mocks.ts (MSW) per onderdeel
├── mocks/               MSW-setup, verzamelt de handlers van alle features
├── types/index.ts       domeintypes volgens de casus
└── routes.tsx           alle routes
```
