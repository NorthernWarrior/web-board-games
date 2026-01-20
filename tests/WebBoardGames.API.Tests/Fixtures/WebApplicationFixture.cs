using Alba;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Testcontainers.MongoDb;
using WebBoardGames.Persistence;

namespace WebBoardGames.API.Tests.Fixtures;

public class WebApplicationFixture : IAsyncLifetime
{
    private readonly MongoDbContainer _mongoContainer = new MongoDbBuilder("mongo:8")
            .Build();

    private IAlbaHost? _sharedHost;

    public string MongoConnectionString { get; private set; } = string.Empty;

    public async ValueTask InitializeAsync()
    {
        await _mongoContainer.StartAsync();
        MongoConnectionString = _mongoContainer.GetConnectionString();
    }

    public async Task<IAlbaHost> CreateHost()
    {
        var host = await AlbaHost.For<Program>(builder =>
        {
            builder.UseEnvironment("Test");
            builder.ConfigureAppConfiguration((context, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ConnectionStrings:MongoDb"] = MongoConnectionString
                });
            });
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<DbContextOptions<BoardGamesDbContext>>();
                services.RemoveAll<BoardGamesDbContext>();
                services.AddDbContext<BoardGamesDbContext>(x => x
                    .EnableSensitiveDataLogging(true)
                    .UseMongoDB(MongoConnectionString, "web-board-games")
                );
            });
        });

        return host;
    }

    public async Task<IAlbaHost> GetSharedHost()
    {
        _sharedHost ??= await CreateHost();
        return _sharedHost;
    }

    public async ValueTask DisposeAsync()
    {
        GC.SuppressFinalize(this);
        if (_sharedHost != null)
        {
            await _sharedHost.DisposeAsync();
        }

        if (_mongoContainer != null)
        {
            await _mongoContainer.DisposeAsync();
        }
    }
}
