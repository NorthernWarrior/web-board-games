# Web Board Games - Angular UI

Frontend application for the Web Board Games platform, built with Angular 21 and Angular Material.

## Project Overview

This Angular application provides the user interface for playing various board games online. The project is configured with:

- **Angular**: v21.0.8
- **Angular Material**: v21.0.6 for UI components
- **TypeScript**: v5.9.2
- **Server-Side Rendering (SSR)**: Enabled via @angular/ssr
- **Styling**: SCSS with Angular Material theming
- **Testing**: Karma + Jasmine with headless Chrome support

## Project Structure

```
src/
├── app/
│   ├── api/              # API service layer
│   ├── monopoly/         # Monopoly game components
│   ├── shared-components/ # Reusable UI components
│   ├── app.ts            # Root component
│   └── app.routes.ts     # Application routing
├── environments/         # Environment configurations
└── styles.scss          # Global styles
```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm (comes with Node.js)

### Installation

```bash
npm install
```

### Development Server

To start a local development server:

```bash
npm start
# or
ng serve
```

The application will be available at `http://localhost:4200/`. The app automatically reloads when you modify source files.

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `ng serve` | Start development server |
| `build` | `npm run set-version && ng build` | Build for production |
| `watch` | `ng build --watch --configuration development` | Build and watch for changes |
| `test` | `ng test` | Run tests in watch mode |
| `test:ci` | `ng test --no-watch --browsers=ChromeHeadless --code-coverage` | Run tests once with coverage (CI-friendly) |
| `serve:ssr:angular-ui` | `node dist/angular-ui/server/server.mjs` | Serve SSR build |

## Building

To build the project for production:

```bash
npm run build
```

Build artifacts are stored in the `dist/` directory. The production build includes:
- Automatic version injection from package.json
- Output hashing for cache busting
- Server-side rendering setup
- Optimizations for performance

### Build Configurations

- **Production** (default): Optimized build with minification and tree-shaking
- **Development**: Faster builds with source maps, no optimization

## Testing

### Running Tests

**Interactive mode** (watches for file changes):
```bash
npm test
# or
ng test
```

**CI/Headless mode** (single run with coverage):
```bash
npm run test:ci
```

This command:
- Runs tests once without watching
- Uses headless Chrome (no UI required)
- Generates code coverage reports in `coverage/`
- Suitable for CI/CD pipelines

### Test Configuration

- **karma.conf.js**: Karma test runner configuration
- **Test files**: `*.spec.ts` files contain unit tests
- **Test framework**: Jasmine for assertions and test structure
- **Test utilities**: Angular Testing Library (@angular/core/testing)

### Writing Tests

Tests use Jasmine syntax with Angular's testing utilities:

```typescript
import { TestBed } from '@angular/core/testing';
import { MyComponent } from './my-component';

describe('MyComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MyComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display the title', () => {
    const fixture = TestBed.createComponent(MyComponent);
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();
    
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toBe('Test Title');
  });
});
```

For testing services with HTTP:

```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should make a POST request', (done) => {
    service.someMethod(data).subscribe(response => {
      expect(response).toEqual(expectedResponse);
      done();
    });

    const req = httpMock.expectOne('/api/endpoint');
    expect(req.request.method).toBe('POST');
    req.flush(expectedResponse);
  });
});
```

## Code Scaffolding

Generate new components, services, and other Angular artifacts:

```bash
# Generate a component
ng generate component component-name

# Generate a service
ng generate service service-name

# Generate a module
ng generate module module-name

# See all available schematics
ng generate --help
```

All generated components use SCSS for styling (configured in angular.json).

## Configuration

### Angular Configuration (angular.json)

- **Component prefix**: `app`
- **Style format**: SCSS
- **Build output**: `dist/angular-ui/`
- **SSR**: Enabled with server-side rendering
- **File replacements**: `environment.ts` → `environment.prod.ts` in production

### TypeScript Configuration

- **tsconfig.json**: Base TypeScript configuration
- **tsconfig.app.json**: Configuration for application files
- **tsconfig.spec.json**: Configuration for test files

### Code Formatting (Prettier)

- **Print width**: 100 characters
- **Quotes**: Single quotes
- **HTML**: Angular parser for templates

## CI/CD Integration

An example workflow is provided in `.github/workflows/pr-verify-angular.yaml.example` for Gitea Actions or GitHub Actions. To enable:

1. Rename `pr-verify-angular.yaml.example` to `pr-verify-angular.yaml`
2. The workflow will:
   - Install dependencies
   - Build the Angular project
   - Run tests in headless mode
   - Upload coverage reports as artifacts

## Additional Resources

- [Angular Documentation](https://angular.dev)
- [Angular CLI Reference](https://angular.dev/tools/cli)
- [Angular Material Components](https://material.angular.io/components)
- [RxJS Documentation](https://rxjs.dev)

