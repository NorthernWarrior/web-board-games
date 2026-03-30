---
description: "Use when writing or editing Angular unit tests (.spec.ts). Covers TestBed setup, signals testing, HTTP mocking, and assertion patterns for this zoneless Angular project."
applyTo: "WebBoardGames.API/angular-ui/**/*.spec.ts"
---

# Angular Testing Conventions

Framework: **Karma + Jasmine**. Run with `npm run test:ci` from `WebBoardGames.API/angular-ui/`.

## TestBed setup

- Always include `provideZonelessChangeDetection()` in component test providers — this project has no Zone.js
- Import standalone components directly: `imports: [MyComponent]`
- For HTTP services: `provideHttpClient()` + `provideHttpClientTesting()` (not the deprecated `HttpClientTestingModule`)

```ts
beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [MyComponent],
    providers: [provideZonelessChangeDetection()]
  }).compileComponents();
});
```

## HTTP testing

- Inject `HttpTestingController` as `httpMock`
- **Always** call `httpMock.verify()` in `afterEach()` to catch unhandled requests
- Use `done` callback for async observable assertions

```ts
afterEach(() => {
  httpMock.verify();
});

it('should fetch data', (done) => {
  service.getData().subscribe(result => {
    expect(result).toEqual(expected);
    done();
  });
  const req = httpMock.expectOne('/api/endpoint');
  expect(req.request.method).toBe('POST');
  req.flush(mockResponse);
});
```

## Signals & inputs

- Read signal values as function calls: `component.mySignal()`
- Set signal inputs via `fixture.componentRef.setInput('name', value)` — not by assigning properties
- Call `fixture.detectChanges()` after setting inputs

## Assertions

Use Jasmine matchers: `toBeTruthy()`, `toBe()`, `toEqual()`, `toContain()`. No Shouldly-style or Jest-style matchers.
