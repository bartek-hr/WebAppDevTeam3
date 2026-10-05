# WebAppDevTeam3 — GameShelf

Applicatie voor bordspelclub GameShelf: catalogus, collecties en planken, uitlenen, spelavonden en
verlanglijsten/ruilen. De volledige casus staat in [docs/CASUS.md](docs/CASUS.md) en de taakverdeling
in [docs/TAAKVERDELING.md](docs/TAAKVERDELING.md).

## Structuur

```
GameShelf.sln
├── src/
│   ├── gameshelf.client/        React + TypeScript (Vite) frontend
│   └── GameShelf.Server/        ASP.NET Core Web API (.NET 10)
├── tests/
│   └── GameShelf.Server.Tests/  xUnit-tests voor de backend
└── docs/                        casus en taakverdeling
```

## Benodigdheden

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) 22 of nieuwer (getest met 24)
- Visual Studio 2022 (17.14+) of 2026 met de workload *ASP.NET and web development*, of VS Code

## Starten

**Alleen de frontend (met nepdata, geen backend nodig):**

```bash
cd src/gameshelf.client
npm install
npm run dev
```

Open daarna http://localhost:5173. Met `VITE_USE_MOCKS=true` in `.env.development` komt alle data uit
`src/features/*/mocks.ts`.

**Frontend en backend samen:** open `GameShelf.sln` in Visual Studio en start `GameShelf.Server`
(profiel `https`). De backend start de Vite dev-server vanzelf (SpaProxy). Calls naar `/api/...`
worden doorgestuurd naar de backend. De API-documentatie staat op https://localhost:7264/scalar.

## Handige commando's (in `src/gameshelf.client`)

| Commando         | Wat het doet                               |
| ---------------- | ------------------------------------------ |
| `npm run dev`    | dev-server op http://localhost:5173        |
| `npm run build`  | typecheck + productiebuild                 |
| `npm run lint`   | linter (oxlint)                            |
| `npm test`       | tests (Vitest + Testing Library)           |
| `npm run format` | code formatteren (Prettier)                |

## Packages

**Frontend:** react-router-dom (routing), @tanstack/react-query + axios (API-calls en caching),
bootstrap + react-bootstrap + react-bootstrap-icons (UI), react-hook-form + zod + @hookform/resolvers
(formulieren en validatie), date-fns (datums), msw (nep-API), vitest + @testing-library (tests),
prettier + oxlint (codestijl).

**Backend:** Entity Framework Core (SqlServer, Design, Tools), ASP.NET Core Identity, JWT Bearer
authenticatie, SpaProxy (start de frontend mee) en Scalar (API-documentatie). De tests gebruiken
Mvc.Testing en EF Core InMemory.

> `nuget.config` in de root gebruikt alleen nuget.org, zodat persoonlijke of bedrijfsfeeds
> de restore niet breken.
