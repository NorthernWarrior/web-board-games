---
description: "Use when creating or editing FastEndpoints API endpoints, request/response records, validators, or endpoint groups in the .NET backend."
applyTo: "WebBoardGames.*/Features/**/*.cs"
---

# FastEndpoints Conventions

## File organization

Each feature gets its own folder with co-located files:

```
Features/<Game>/<FeatureName>/
  <FeatureName>Endpoint.cs
  <FeatureName>Request.cs
  <FeatureName>Response.cs
```

## Endpoint class

- Inherit `Endpoint<TRequest, TResponse>` or `Endpoint<TRequest>` (no response) or `EndpointWithoutRequest`
- Use **primary constructor** for DI: `public class MyEndpoint(BoardGamesDbContext _context) : Endpoint<MyRequest, MyResponse>`
- Assign `Response = ...` instead of returning from `HandleAsync`

```csharp
public class GameCreateEndpoint(BoardGamesDbContext _context) : Endpoint<GameCreateRequest, GameCreateResponse>
{
    public override void Configure()
    {
        Post("/create");
        Group<BankerGroup>();
        AllowAnonymous();
        Options(x => x.RequireRateLimiting("GameCreatePolicy"));
    }

    public override async Task HandleAsync(GameCreateRequest req, CancellationToken ct)
    {
        // business logic...
        Response = new(game.ExternalID, player.ExternalID);
    }
}
```

## Request & Response

- Use **records** for both
- Nest the `Validator` class **inside** the request record
- Validator inherits `FastEndpoints.Validator<TRequest>`, uses FluentValidation rules

```csharp
public record GameCreateRequest(string Label, string PlayerName, bool MoneyOnFreeParking, bool DoubleMoneyOnGo)
{
    public class Validator : FastEndpoints.Validator<GameCreateRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Label).NotEmpty().MaximumLength(100);
            RuleFor(x => x.PlayerName).NotEmpty().MaximumLength(100);
        }
    }
}

public record GameCreateResponse(string GameID, string PlayerID);
```

## Group hierarchy

Groups define route prefixes and compose into a hierarchy. Routes build as `/api/<group>/<group>/<endpoint-route>`.

```csharp
// Top-level: /api/monopoly
internal class MonopolyGroup : Group
{
    public MonopolyGroup() { Configure("monopoly", ep => { }); }
}

// Sub-group: /api/monopoly/banker
internal class BankerGroup : SubGroup<MonopolyGroup>
{
    public BankerGroup() { Configure("banker", ep => { }); }
}
```

For auth-protected groups, configure in the group constructor:

```csharp
Configure("monitoring", ep =>
{
    ep.AuthSchemes("ApiKey");
    ep.Claims("monitoring:ro");
});
```

## SSE streaming

Use `Send.EventStreamAsync()` with an `IAsyncEnumerable` generator:

```csharp
Description(b => b.Produces(200, contentType: "text/event-stream"));
await Send.EventStreamAsync("event-name", _StreamAsync(ct), ct);
```

## Key rules

- Always use `ExternalID` (string) in endpoint routes and responses — never expose `ObjectId`
- Rate limiting policies (`GameCreatePolicy`, `GameJoinPolicy`) are in `Program.cs` — apply via `Options(x => x.RequireRateLimiting("..."))`
- Register new services using `extension(IServiceCollection)` syntax in a `ServiceCollectionExtensions.cs` and wire into `Program.cs`
- Endpoint discovery is automatic via source generators (`DiscoveredTypes.All`)
