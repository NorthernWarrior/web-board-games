using Alba;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Testcontainers.MongoDb;
using DotNet.Testcontainers.Builders;
using WebBoardGames.Persistence;

namespace WebBoardGames.API.Tests.Fixtures;

public class WebApplicationFixture : IAsyncLifetime
{
    private MongoDbContainer? _mongoContainer;
    private IAlbaHost? _sharedHost;
    
    public string MongoConnectionString { get; private set; } = string.Empty;

    public async ValueTask InitializeAsync()
    {
        _mongoContainer = new MongoDbBuilder()
            .WithImage("mongo:8")
            .Build();

        await _mongoContainer.StartAsync();
        MongoConnectionString = _mongoContainer.GetConnectionString();
        
        // Give MongoDB a moment to fully initialize
        await Task.Delay(3000);
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
        });

        return host;
    }

    public async Task<IAlbaHost> GetSharedHost()
    {
        if (_sharedHost == null)
        {
            _sharedHost = await CreateHost();
        }
        return _sharedHost;
    }

    public async ValueTask DisposeAsync()
    {
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
