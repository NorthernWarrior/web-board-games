using Alba;
using WebBoardGames.Persistence;

namespace WebBoardGames.API.Tests.Fixtures;

[Collection(nameof(WebApplicationFixtureCollection))]
public abstract class IntegrationTestBase : IAsyncLifetime
{
    protected readonly WebApplicationFixture Fixture;
    protected IAlbaHost Host { get; private set; } = null!;
    protected IServiceScope? ServiceScope { get; private set; }
    protected IServiceScope? AssertScope { get; private set; }

    protected IntegrationTestBase(WebApplicationFixture fixture)
    {
        Fixture = fixture;
    }

    public virtual async ValueTask InitializeAsync()
    {
        Host = await Fixture.GetSharedHost();
        ServiceScope = Host.Services.CreateScope();
        AssertScope = Host.Services.CreateScope();
    }

    public virtual ValueTask DisposeAsync()
    {
        // Skip cleanup - let fixture handle container disposal
        ServiceScope?.Dispose();
        ServiceScope = null;
        AssertScope?.Dispose();
        AssertScope = null;
        return ValueTask.CompletedTask;
    }

    protected BoardGamesDbContext GetDbContext(bool forAssert = false)
    {
        if (AssertScope == null)
            throw new InvalidOperationException("AssertScope is not initialized");
        if (ServiceScope == null)
            throw new InvalidOperationException("ServiceScope is not initialized");

        var scope = forAssert ? AssertScope : ServiceScope;
        return scope.ServiceProvider.GetRequiredService<BoardGamesDbContext>();
    }

    private async Task CleanupDatabase()
    {
        if (ServiceScope == null)
            return;
        if (AssertScope == null)
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
