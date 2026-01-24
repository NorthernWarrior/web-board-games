# Web Board Games - Copilot Instructions

## Project Overview

This is a full-stack web application for playing board games online, specifically focused on Monopoly Banker game. The project consists of:
- **Backend**: .NET 10 web API using FastEndpoints, MongoDB for persistence
- **Frontend**: Angular 21 with Angular Material UI components
- **Architecture**: Clean architecture with Domain, Application, Persistence, and API layers

## Technology Stack

### Backend (.NET)
- **.NET Version**: 10.0.102
- **Framework**: ASP.NET Core with minimal APIs via FastEndpoints
- **Database**: MongoDB with official MongoDB.Driver
- **Key Libraries**: 
  - FastEndpoints for API endpoints
  - Quartz.NET for scheduled jobs
  - Microsoft.FeatureManagement for feature flags
  - Entity Framework Core (alongside MongoDB)
- **Testing**: xUnit, Alba for HTTP testing, Testcontainers for MongoDB, Shouldly, Bogus

### Frontend (Angular)
- **Angular Version**: 21.0.8
- **Node Version**: 20.x
- **UI Framework**: Angular Material 21.0.6
- **TypeScript**: 5.9.2
- **Server-Side Rendering**: Enabled via @angular/ssr
- **Testing**: Karma + Jasmine with headless Chrome

## Project Structure

```
/
├── .github/
│   └── workflows/
│       └── pr-verify.yaml          # CI/CD workflow for PR verification
├── WebBoardGames.API/              # Presentation layer (API & Angular host)
│   ├── angular-ui/                 # Angular frontend application
│   ├── Program.cs                  # API entry point
│   └── Authentication/             # API key authentication
├── WebBoardGames.Application/      # Application layer (business logic)
│   ├── Features/                   # Feature-based organization
│   └── Services/                   # Application services
├── WebBoardGames.Domain/           # Domain layer (entities, interfaces)
│   ├── Constants/
│   ├── Options/
│   └── Services/
├── WebBoardGames.Monopoly/         # Monopoly game-specific logic
├── WebBoardGames.Persistence/      # Data access layer (MongoDB)
├── tests/
│   ├── WebBoardGames.API.Tests/    # Integration tests
│   └── WebBoardGames.Application.Tests/
├── docker-compose.yml              # Docker orchestration
└── web-board-games.slnx            # Solution file (XML format)
```

## Build and Test Instructions

### Backend (.NET)

**ALWAYS run commands in the repository root unless otherwise specified.**

#### Prerequisites
- .NET 10.0.102 SDK installed
- Docker running (for integration tests)

#### Restore Dependencies
```bash
dotnet restore web-board-games.slnx
```
**Time**: ~5-10 seconds  
**Note**: Always run this first after cloning or when project files change.

#### Build Backend
```bash
dotnet build web-board-games.slnx --configuration Release
```
**Time**: ~15-20 seconds  
**Note**: Use `--no-restore` flag if dependencies were just restored to save time.

#### Run Backend Tests
```bash
dotnet test web-board-games.slnx --configuration Release --no-build
```
**Time**: ~10-30 seconds  
**Dependencies**: Requires Docker to be running for Testcontainers to spin up MongoDB.  
**Note**: Integration tests use Testcontainers for MongoDB. If tests fail with container issues, ensure Docker is running and accessible.

#### Run Backend Tests with Coverage
```bash
dotnet test web-board-games.slnx --configuration Release --no-build --collect:"XPlat Code Coverage" --results-directory ./TestResults
```

### Frontend (Angular)

**ALWAYS run Angular commands from the `WebBoardGames.API/angular-ui` directory.**

#### Prerequisites
- Node.js 20.x or higher
- npm (comes with Node.js)

#### Install Dependencies
```bash
cd WebBoardGames.API/angular-ui
npm ci
```
**Time**: ~10-15 seconds  
**Note**: Use `npm ci` (not `npm install`) for clean, reproducible installs from package-lock.json. Always run this before building or testing.

#### Build Angular Frontend
```bash
cd WebBoardGames.API/angular-ui
npm run build
```
**Time**: ~20-30 seconds  
**Note**: This runs `npm run set-version` first (injects version from package.json), then builds for production.

#### Run Angular Tests (Interactive)
```bash
cd WebBoardGames.API/angular-ui
npm test
```
**Note**: Opens Karma in watch mode with Chrome. For CI/automated testing, use `test:ci` instead.

#### Run Angular Tests (CI Mode)
```bash
cd WebBoardGames.API/angular-ui
npm run test:ci
```
**Time**: ~10-15 seconds  
**Note**: Runs tests once in headless Chrome with code coverage. Use this for validation in CI or after making changes.

#### Start Angular Development Server
```bash
cd WebBoardGames.API/angular-ui
npm start
```
**Note**: Serves on `http://0.0.0.0:4200/` with hot reload enabled.

## CI/CD Workflow

The repository uses GitHub Actions/Gitea Actions with a PR verification workflow (`.github/workflows/pr-verify.yaml`).

### Workflow Triggers
- Pull requests to `main` branch
- Ignores changes to: `docs/**`, `.github/**`, `*.md`, `.gitignore`, `.gitattributes`

### Workflow Jobs

1. **file-changes-check**: Detects which parts of the codebase changed
   - `angular`: Changes in `WebBoardGames.API/angular-ui/**`
   - `backend`: Changes in `WebBoardGames*/**` (excluding Angular)

2. **backend-verify** (runs if backend files changed):
   - Setup .NET 10.0.102
   - Cache NuGet packages
   - `dotnet restore web-board-games.slnx`
   - `dotnet build web-board-games.slnx --configuration Release`
   - `dotnet test web-board-games.slnx --configuration Release --no-build --collect:"XPlat Code Coverage"`

3. **angular-verify** (runs if Angular files changed):
   - Setup Node.js 20
   - Cache npm packages
   - `npm ci` (in `WebBoardGames.API/angular-ui`)
   - `npm run build`
   - `npm run test:ci`
   - Upload coverage reports as artifacts

**Important**: The workflow runs on self-hosted runners with Linux.

## Common Development Patterns

### Code Organization
- **Backend**: Uses feature-based organization in the Application layer
- **Frontend**: Angular standalone components (no NgModules)
- **Testing**: 
  - Backend: Integration tests using Alba and Testcontainers
  - Frontend: Unit tests with Jasmine/Karma

### Authentication
- API uses custom API key authentication (see `WebBoardGames.API/Authentication/ApiKeyAuthenticationHandler.cs`)
- Rate limiting configured for game creation and joining endpoints

### Database
- MongoDB is the primary database
- Connection configured via `appsettings.json` or environment variables
- Integration tests use Testcontainers to spin up ephemeral MongoDB instances

### Docker
- `docker-compose.yml` defines services for MongoDB and the API
- MongoDB health check configured with 30-second start period
- API depends on MongoDB being healthy before starting

## Key Configuration Files

- `web-board-games.slnx`: Solution file (XML format, .NET 9+)
- `WebBoardGames.API/appsettings.json`: API configuration
- `WebBoardGames.API/angular-ui/angular.json`: Angular project configuration
- `WebBoardGames.API/angular-ui/package.json`: npm dependencies and scripts
- `WebBoardGames.API/angular-ui/karma.conf.js`: Test runner configuration
- `docker-compose.yml` and `docker-compose.override.yml`: Docker orchestration

## Testing Guidelines

### Backend Tests
- Integration tests in `tests/WebBoardGames.API.Tests/`
- Use Alba for HTTP endpoint testing
- Use Testcontainers for MongoDB (requires Docker)
- Test organization by features: `Features/Banker/`

### Frontend Tests
- Unit tests co-located with components: `*.spec.ts`
- Use Angular Testing Library utilities
- Test with `provideHttpClient()` and `provideHttpClientTesting()` for HTTP services
- Always call `httpMock.verify()` in `afterEach()` for HTTP tests

## Important Notes

1. **Always restore dependencies first**: Run `dotnet restore` for backend and `npm ci` for frontend before building.

2. **Docker requirement**: Integration tests require Docker to be running. If Testcontainers fails, check:
   - Docker is running and accessible
   - Docker socket permissions are correct
   - Consider setting `TESTCONTAINERS_RYUK_DISABLED=true` if ryuk container causes issues

3. **Build order matters**: For backend, restore → build → test. For frontend, install → build → test.

4. **Angular SSR**: The frontend has server-side rendering enabled. Build output includes both browser and server bundles.

5. **CI environment**: The workflow uses self-hosted Linux runners, so commands should be Linux-compatible.

6. **Time expectations**: 
   - Backend build: ~15-20 seconds
   - Backend tests: ~10-30 seconds
   - Angular install: ~10-15 seconds
   - Angular build: ~20-30 seconds
   - Angular tests: ~10-15 seconds

7. **Code style**: 
   - Angular uses Prettier with 100-char line width, single quotes
   - Angular uses `.editorconfig` for editor settings
   - No explicit C# formatting config, follow .NET conventions

8. **When making changes**:
   - Test locally with the same commands CI uses
   - For backend: `dotnet test --configuration Release`
   - For Angular: `npm run test:ci`
   - Always verify integration tests pass if you modify API endpoints or database logic
