using Alba;
using Microsoft.Extensions.DependencyInjection;
using WebBoardGames.Persistence;

namespace WebBoardGames.API.Tests.Fixtures;

public abstract class IntegrationTestBase : IClassFixture<WebApplicationFixture>, IAsyncLifetime
{
    protected readonly WebApplicationFixture Fixture;
    protected IAlbaHost Host { get; private set; } = null!;
    protected IServiceScope? ServiceScope { get; private set; }

    protected IntegrationTestBase(WebApplicationFixture fixture)
    {
        Fixture = fixture;
    }

    public virtual async Task InitializeAsync()
    {
        Host = await Fixture.GetSharedHost();
        ServiceScope = Host.Services.CreateScope();
    }

    public virtual async Task DisposeAsync()
    {
        if (ServiceScope != null)
        {
            // Skip cleanup - let fixture handle container disposal
            ServiceScope.Dispose();
            ServiceScope = null;
        }
    }

    protected BoardGamesDbContext GetDbContext()
    {
        if (ServiceScope == null)
            throw new InvalidOperationException("ServiceScope is not initialized");
            
        return ServiceScope.ServiceProvider.GetRequiredService<BoardGamesDbContext>();
    }

    private async Task CleanupDatabase()
    {
        if (ServiceScope == null)
            return;

        try
        {
            var context = ServiceScope.ServiceProvider.GetRequiredService<BoardGamesDbContext>();
            context.MonopolyBankerGames.RemoveRange(context.MonopolyBankerGames);
            await context.SaveChangesAsync();
        }
        catch
        {
            // Ignore cleanup errors
        }
    }
}
