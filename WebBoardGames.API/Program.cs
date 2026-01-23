using FastEndpoints;
using FastEndpoints.Swagger;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.FeatureManagement;
using MongoDB.Driver;
using System.Threading.RateLimiting;
using WebBoardGames.API;
using WebBoardGames.API.Authentication;
using WebBoardGames.Application;
using WebBoardGames.Domain.Constants;
using WebBoardGames.Domain.Options;
using WebBoardGames.Monopoly.Services;
using WebBoardGames.Persistence;

var builder = WebApplication.CreateSlimBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonSerializerContext.Default);
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi()
    .AddLocalization(options => options.ResourcesPath = "Resources")
    .AddFeatureManagement(builder.Configuration.GetSection("Features"))
    .Services.AddRateLimiter(options =>
    {
        options.RejectionStatusCode = 429;
        options.AddPolicy("GameCreatePolicy", httpContext => RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromDays(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0,
                AutoReplenishment = true,
            }));
        options.AddPolicy("GameJoinPolicy", httpContext => RateLimitPartition.GetFixedWindowLimiter(
           partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
           factory: _ => new FixedWindowRateLimiterOptions
           {
               PermitLimit = 20,
               Window = TimeSpan.FromDays(1),
               QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
               QueueLimit = 0,
               AutoReplenishment = true,
           }));
    })
    .AddMonopolyDomainOptionServices(builder.Configuration)
    .RegisterServicesFromWebBoardGamesApplication()
    .RegisterServicesFromMonopoly();

builder.AddMinimalApiAngular($"http://{builder.Configuration["DOCKER_HOST"] ?? "localhost"}:4200");

var mongoConnectionString = builder.Configuration.GetConnectionString("MongoDb") ?? "mongodb://localhost:27017";
builder.Services.AddDbContext<BoardGamesDbContext>(x => x
        .EnableSensitiveDataLogging(builder.Environment.IsDevelopment())
        .UseMongoDB(mongoConnectionString, "web-board-games")
    )
    .AddSingleton<IMongoClient>(sp => new MongoClient(mongoConnectionString));

builder.Services
    .AddFastEndpoints(o =>
    {
        o.SourceGeneratorDiscoveredTypes.AddRange(WebBoardGames.Application.DiscoveredTypes.All);
        o.SourceGeneratorDiscoveredTypes.AddRange(WebBoardGames.Monopoly.DiscoveredTypes.All);
    })
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = AuthConstants.BearerSchema;
    })
    .AddScheme<AuthenticationSchemeOptions, ApiKeyAuthenticationHandler>(AuthConstants.ApiKeySchema, null)
    .Services
    .AddAuthorization();

if (builder.Environment.IsDevelopment())
{
    builder.Services.SwaggerDocument(o =>
     {
         o.DocumentSettings = s =>
         {
             s.Title = "Web Board Games API";
             s.Version = "v1";
             s.DocumentName = "v1";
         };
     });
}

var app = builder.Build();


var supportedCultures = new[] { "en", "en-US", "de", "de-DE" };
app.UseRequestLocalization(opts =>
    {
        opts.ApplyCurrentCultureToResponseHeaders = true;
        opts.SetDefaultCulture("en");
        opts.AddSupportedCultures(supportedCultures);
        opts.AddSupportedUICultures(supportedCultures);
    })
    .UseAuthentication()
    .UseAuthorization();


// Use the correct Angular static output directory for production, with absolute path
var angularPath = Path.Combine(Directory.GetCurrentDirectory(), "angular-ui", "browser");
app.UseMinimalApiAngular(angularPath)
    .UseFastEndpoints(options =>
    {
        options.Endpoints.RoutePrefix = "api";
        options.Serializer.Options.TypeInfoResolver = AppJsonSerializerContext.Default;
    });

if (app.Environment.IsDevelopment())
{
    app.UseSwaggerGen();
}

#if DEBUG
if (!app.Environment.EnvironmentName.Equals("Test", StringComparison.OrdinalIgnoreCase))
{
    var context = app.Services.CreateScope().ServiceProvider.GetRequiredService<BoardGamesDbContext>();
    context.Database.AutoTransactionBehavior = AutoTransactionBehavior.Never;
    context.MonopolyBankerGames.RemoveRange(context.MonopolyBankerGames.Where(e => e.ExternalID == "1234"));
    context.MonopolyBankerGames.Add(new()
    {
        ID = MongoDB.Bson.ObjectId.GenerateNewId(),
        ExternalID = "1234",
        Label = "Test Game",
        State = WebBoardGames.Persistence.Entities.Monopoly.Banker.MonopolyBankerGameState.WaitingForPlayers,
        Players = [new() { ID = MongoDB.Bson.ObjectId.GenerateNewId(), ExternalID = "free-parking", Name = "Free Parking", Balance = 0 }],
        Options = new() { DoubleMoneyOnGo = true, MoneyOnFreeParking = true },
        CreatedUTC = DateTime.UtcNow,
        UpdatedUTC = DateTime.UtcNow,
        GameOwnerPlayerID = null,
    });
    await context.SaveChangesAsync();
}
#endif


await app.RunAsync();
