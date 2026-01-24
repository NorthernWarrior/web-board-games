using Bogus;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Shouldly;
using WebBoardGames.API.Tests.Fixtures;
using WebBoardGames.Application.ScheduledJobs;
using WebBoardGames.Persistence;
using WebBoardGames.Persistence.Entities.Monopoly.Banker;
using MongoDB.Bson;
using Quartz;

namespace WebBoardGames.API.Tests.ScheduledJobs;

public class GamesCleanupScheduledJobTests(WebApplicationFixture fixture) : IntegrationTestBase(fixture)
{
    private readonly Faker _faker = new();

    [Fact]
    public async Task Execute_DeletesWaitingForPlayersGamesOlderThan4Hours()
    {
        // Arrange
        var context = GetDbContext();
        context.Database.AutoTransactionBehavior = AutoTransactionBehavior.Never;
        
        // Clean up any existing games
        context.MonopolyBankerGames.RemoveRange(context.MonopolyBankerGames);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        var oldGame = CreateGame(MonopolyBankerGameState.WaitingForPlayers, DateTime.UtcNow.AddHours(-5));
        var recentGame = CreateGame(MonopolyBankerGameState.WaitingForPlayers, DateTime.UtcNow.AddHours(-3));
        
        context.MonopolyBankerGames.AddRange(oldGame, recentGame);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var scopeFactory = ServiceScope!.ServiceProvider.GetRequiredService<IServiceScopeFactory>();
        var job = new GamesCleanupScheduledJob(scopeFactory);
        var jobContext = CreateJobExecutionContext();

        // Act
        await job.Execute(jobContext);

        // Assert
        var assertContext = GetDbContext(forAssert: true);
        var remainingGames = await assertContext.MonopolyBankerGames.ToListAsync(TestContext.Current.CancellationToken);
        
        remainingGames.Count.ShouldBe(1);
        remainingGames[0].ExternalID.ShouldBe(recentGame.ExternalID);
    }

    [Fact]
    public async Task Execute_DeletesInProgressGamesOlderThan7Days()
    {
        // Arrange
        var context = GetDbContext();
        context.Database.AutoTransactionBehavior = AutoTransactionBehavior.Never;
        
        // Clean up any existing games
        context.MonopolyBankerGames.RemoveRange(context.MonopolyBankerGames);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        var oldGame = CreateGame(MonopolyBankerGameState.InProgress, DateTime.UtcNow.AddDays(-8));
        var recentGame = CreateGame(MonopolyBankerGameState.InProgress, DateTime.UtcNow.AddDays(-6));
        
        context.MonopolyBankerGames.AddRange(oldGame, recentGame);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var scopeFactory = ServiceScope!.ServiceProvider.GetRequiredService<IServiceScopeFactory>();
        var job = new GamesCleanupScheduledJob(scopeFactory);
        var jobContext = CreateJobExecutionContext();

        // Act
        await job.Execute(jobContext);

        // Assert
        var assertContext = GetDbContext(forAssert: true);
        var remainingGames = await assertContext.MonopolyBankerGames.ToListAsync(TestContext.Current.CancellationToken);
        
        remainingGames.Count.ShouldBe(1);
        remainingGames[0].ExternalID.ShouldBe(recentGame.ExternalID);
    }

    [Fact]
    public async Task Execute_DeletesCompletedGamesOlderThan1Day()
    {
        // Arrange
        var context = GetDbContext();
        context.Database.AutoTransactionBehavior = AutoTransactionBehavior.Never;
        
        // Clean up any existing games
        context.MonopolyBankerGames.RemoveRange(context.MonopolyBankerGames);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        var oldGame = CreateGame(MonopolyBankerGameState.Completed, DateTime.UtcNow.AddDays(-2));
        var recentGame = CreateGame(MonopolyBankerGameState.Completed, DateTime.UtcNow.AddHours(-12));
        
        context.MonopolyBankerGames.AddRange(oldGame, recentGame);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var scopeFactory = ServiceScope!.ServiceProvider.GetRequiredService<IServiceScopeFactory>();
        var job = new GamesCleanupScheduledJob(scopeFactory);
        var jobContext = CreateJobExecutionContext();

        // Act
        await job.Execute(jobContext);

        // Assert
        var assertContext = GetDbContext(forAssert: true);
        var remainingGames = await assertContext.MonopolyBankerGames.ToListAsync(TestContext.Current.CancellationToken);
        
        remainingGames.Count.ShouldBe(1);
        remainingGames[0].ExternalID.ShouldBe(recentGame.ExternalID);
    }

    [Fact]
    public async Task Execute_DoesNotDeleteRecentGames()
    {
        // Arrange
        var context = GetDbContext();
        context.Database.AutoTransactionBehavior = AutoTransactionBehavior.Never;
        
        // Clean up any existing games
        context.MonopolyBankerGames.RemoveRange(context.MonopolyBankerGames);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        var recentWaitingGame = CreateGame(MonopolyBankerGameState.WaitingForPlayers, DateTime.UtcNow.AddHours(-2));
        var recentInProgressGame = CreateGame(MonopolyBankerGameState.InProgress, DateTime.UtcNow.AddDays(-5));
        var recentCompletedGame = CreateGame(MonopolyBankerGameState.Completed, DateTime.UtcNow.AddHours(-12));
        
        context.MonopolyBankerGames.AddRange(recentWaitingGame, recentInProgressGame, recentCompletedGame);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var scopeFactory = ServiceScope!.ServiceProvider.GetRequiredService<IServiceScopeFactory>();
        var job = new GamesCleanupScheduledJob(scopeFactory);
        var jobContext = CreateJobExecutionContext();

        // Act
        await job.Execute(jobContext);

        // Assert
        var assertContext = GetDbContext(forAssert: true);
        var remainingGames = await assertContext.MonopolyBankerGames.ToListAsync(TestContext.Current.CancellationToken);
        
        remainingGames.Count.ShouldBe(3);
    }

    [Fact]
    public async Task Execute_HandlesMixedScenarioCorrectly()
    {
        // Arrange
        var context = GetDbContext();
        context.Database.AutoTransactionBehavior = AutoTransactionBehavior.Never;
        
        // Clean up any existing games
        context.MonopolyBankerGames.RemoveRange(context.MonopolyBankerGames);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        // Games that should be deleted
        var oldWaitingGame = CreateGame(MonopolyBankerGameState.WaitingForPlayers, DateTime.UtcNow.AddHours(-5));
        var oldInProgressGame = CreateGame(MonopolyBankerGameState.InProgress, DateTime.UtcNow.AddDays(-8));
        var oldCompletedGame = CreateGame(MonopolyBankerGameState.Completed, DateTime.UtcNow.AddDays(-2));
        
        // Games that should NOT be deleted
        var recentWaitingGame = CreateGame(MonopolyBankerGameState.WaitingForPlayers, DateTime.UtcNow.AddHours(-3));
        var recentInProgressGame = CreateGame(MonopolyBankerGameState.InProgress, DateTime.UtcNow.AddDays(-6));
        var recentCompletedGame = CreateGame(MonopolyBankerGameState.Completed, DateTime.UtcNow.AddHours(-12));
        
        context.MonopolyBankerGames.AddRange(
            oldWaitingGame, oldInProgressGame, oldCompletedGame,
            recentWaitingGame, recentInProgressGame, recentCompletedGame
        );
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var scopeFactory = ServiceScope!.ServiceProvider.GetRequiredService<IServiceScopeFactory>();
        var job = new GamesCleanupScheduledJob(scopeFactory);
        var jobContext = CreateJobExecutionContext();

        // Act
        await job.Execute(jobContext);

        // Assert
        var assertContext = GetDbContext(forAssert: true);
        var remainingGames = await assertContext.MonopolyBankerGames.ToListAsync(TestContext.Current.CancellationToken);
        
        remainingGames.Count.ShouldBe(3);
        remainingGames.ShouldContain(g => g.ExternalID == recentWaitingGame.ExternalID);
        remainingGames.ShouldContain(g => g.ExternalID == recentInProgressGame.ExternalID);
        remainingGames.ShouldContain(g => g.ExternalID == recentCompletedGame.ExternalID);
        remainingGames.ShouldNotContain(g => g.ExternalID == oldWaitingGame.ExternalID);
        remainingGames.ShouldNotContain(g => g.ExternalID == oldInProgressGame.ExternalID);
        remainingGames.ShouldNotContain(g => g.ExternalID == oldCompletedGame.ExternalID);
    }

    [Fact]
    public async Task Execute_WithNoGames_DoesNotThrowException()
    {
        // Arrange
        var scopeFactory = ServiceScope!.ServiceProvider.GetRequiredService<IServiceScopeFactory>();
        var job = new GamesCleanupScheduledJob(scopeFactory);
        var jobContext = CreateJobExecutionContext();

        // Act & Assert
        await Should.NotThrowAsync(async () => await job.Execute(jobContext));
    }

    [Fact]
    public async Task Execute_DeletesOnlyOldGames_PreservesAllRecentGames()
    {
        // Arrange
        var context = GetDbContext();
        context.Database.AutoTransactionBehavior = AutoTransactionBehavior.Never;
        
        // Clean up any existing games
        context.MonopolyBankerGames.RemoveRange(context.MonopolyBankerGames);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
        
        var veryOldGame = CreateGame(MonopolyBankerGameState.WaitingForPlayers, DateTime.UtcNow.AddDays(-10));
        var justOldEnough = CreateGame(MonopolyBankerGameState.WaitingForPlayers, DateTime.UtcNow.AddHours(-4).AddMinutes(-1));
        var justRecent = CreateGame(MonopolyBankerGameState.WaitingForPlayers, DateTime.UtcNow.AddHours(-4).AddMinutes(1));
        
        context.MonopolyBankerGames.AddRange(veryOldGame, justOldEnough, justRecent);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var scopeFactory = ServiceScope!.ServiceProvider.GetRequiredService<IServiceScopeFactory>();
        var job = new GamesCleanupScheduledJob(scopeFactory);
        var jobContext = CreateJobExecutionContext();

        // Act
        await job.Execute(jobContext);

        // Assert
        var assertContext = GetDbContext(forAssert: true);
        var remainingGames = await assertContext.MonopolyBankerGames.ToListAsync(TestContext.Current.CancellationToken);
        
        remainingGames.Count.ShouldBe(1);
        remainingGames[0].ExternalID.ShouldBe(justRecent.ExternalID);
    }

    private Game CreateGame(MonopolyBankerGameState state, DateTime updatedUTC)
    {
        return new Game
        {
            ID = ObjectId.GenerateNewId(),
            ExternalID = Guid.NewGuid().ToString(),
            Label = _faker.Lorem.Sentence(3),
            State = state,
            Players = new List<Player>(),
            Options = new Options
            {
                MoneyOnFreeParking = _faker.Random.Bool(),
                DoubleMoneyOnGo = _faker.Random.Bool()
            },
            CreatedUTC = DateTime.UtcNow.AddDays(-30),
            UpdatedUTC = updatedUTC,
            GameOwnerPlayerID = null
        };
    }

    private static IJobExecutionContext CreateJobExecutionContext()
    {
        var mock = new Mock<IJobExecutionContext>();
        return mock.Object;
    }
}
