# Web Board Games — Project Guidelines

A collection of browser-based board games and fun interactive experiences. Currently includes Monopoly Banker, Monopoly Classic (Pixi.js board), and a maze generator — with more games planned.

## Architecture

**Backend** — .NET 10, FastEndpoints, MongoDB (EF Core provider), Quartz.NET scheduled jobs, feature flags.
Clean architecture layers: `Domain → Application → Monopoly → Persistence → API`.

**Frontend** — Angular 21, Angular Material 3, SSR via `@angular/ssr`, Pixi.js game engine.
All components are **standalone** (no NgModules). Zoneless change detection (`provideZonelessChangeDetection()`).

### Key conventions

- **Feature-based organization**: Each game/feature gets its own folder with endpoint, request, response, and validator co-located (e.g. `WebBoardGames.Monopoly/Features/Banker/GameCreate/`)
- **FastEndpoints pattern**: Inherit `Endpoint<TRequest, TResponse>`, configure route/group/auth in `Configure()`, logic in `HandleAsync()`. Endpoint discovery via source generators (`DiscoveredTypes.All`)
- **Angular signals everywhere**: Use `signal()`, `computed()`, `input()`, `output()`, `effect()` — not decorators
- **Game engine**: `src/app/engine/` wraps Pixi.js. `GameEngineCanvasComponent` emits a `GameEngine` instance; add `GameEntity` subclasses to it. Used by Monopoly Classic and Maze Generator
- **Shared components module**: `src/app/shared-components/` — `ButtonTileComponent`, `ButtonTilesGridComponent`, `DigitsDisplayComponent`
- **Real-time streaming**: Server-Sent Events via `EventSource` on the client, `Send.EventStreamAsync()` on the server, with a singleton event service for pub/sub
- **Entities are sealed classes** for performance. `BoardGamesDbContext` disables auto-transactions

### Adding a new game

1. Create a new .NET project `WebBoardGames.<GameName>/` or add features under an existing layer
2. Register services in a `ServiceCollectionExtensions` using `extension(IServiceCollection)` syntax and wire into `Program.cs`
3. Add FastEndpoints with group hierarchy: `<GameName>Group : SubGroup<ParentGroup>`
4. Frontend: Lazy-loaded route in `app.routes.ts`, standalone components, signals for state
5. If the game needs a canvas: use `GameEngineCanvasComponent` and implement `GameEntity` subclasses

## Build and Test

**All backend commands run from repo root. All Angular commands run from `WebBoardGames.API/angular-ui/`.**

### Backend (.NET)

```bash
dotnet restore web-board-games.slnx
dotnet build web-board-games.slnx --configuration Release
dotnet test web-board-games.slnx --configuration Release --no-build
```

Integration tests require **Docker running** (Testcontainers spins up MongoDB). If container issues arise, check Docker is accessible or set `TESTCONTAINERS_RYUK_DISABLED=true`.

### Frontend (Angular)

```bash
cd WebBoardGames.API/angular-ui
npm ci
npm run build
npm run test:ci          # Headless Chrome, single run, with coverage
```

Use `npm ci` (not `npm install`). Use `npm run test:ci` for validation, `npm test` for interactive watch mode.

### CI pipeline

See `.github/workflows/pr-verify.yaml`. Detects changed files and only runs affected jobs (backend-verify / angular-verify). Self-hosted Linux runners.

## Code Style

- **Angular**: Prettier — 100-char line width, single quotes. See `.editorconfig`
- **C#**: Follow standard .NET conventions. No explicit formatter configured
- **Testing (backend)**: xUnit + Alba + Testcontainers + Shouldly + Bogus. Feature-based test folders mirroring source. Shared `WebApplicationFixture` with `AlbaHost`
- **Testing (Angular)**: Karma + Jasmine. Use `provideHttpClient()` + `provideHttpClientTesting()`. Call `httpMock.verify()` in `afterEach()`. Match `provideZonelessChangeDetection()` in `TestBed` config

## Pitfalls

- SSR is enabled — guard browser-only APIs (e.g. `EventSource`, `document`) with `isPlatformBrowser()` checks
- `GameEngineCanvasComponent` has a static guard against double-init from navigation; don't remove it
- MongoDB collections use `ExternalID` (string) for public-facing IDs, `ObjectId` for internal — always use `ExternalID` in endpoints
- Rate limiting policies (`GameCreatePolicy`, `GameJoinPolicy`) are defined in `Program.cs` — apply via `Options(x => x.RequireRateLimiting("..."))` on endpoints
- Auth uses custom API key bearer scheme — monitoring endpoints require `monitoring:ro` claim
