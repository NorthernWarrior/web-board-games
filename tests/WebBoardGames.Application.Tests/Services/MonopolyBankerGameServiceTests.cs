using MongoDB.Bson;
using Shouldly;
using WebBoardGames.Monopoly.Features.Banker.Services;
using WebBoardGames.Persistence.Entities.Monopoly.Banker;

namespace WebBoardGames.Application.Tests.Services;

public class MonopolyBankerGameServiceTests
{
    [Fact]
    public void WhereDueForCleanup_WaitingForPlayersOlderThan4Hours_IsMarkedForCleanup()
    {
        // Arrange
        var games = new List<Game>
        {
            CreateGame(MonopolyBankerGameState.WaitingForPlayers, DateTime.UtcNow.AddHours(-5))
        };

        // Act
        var result = MonopolyBankerGameService.WhereDueForCleanup(games).ToList();

        // Assert
        result.Count.ShouldBe(1);
    }

    [Fact]
    public void WhereDueForCleanup_WaitingForPlayersNewerThan4Hours_IsNotMarkedForCleanup()
    {
        // Arrange
        var games = new List<Game>
        {
            CreateGame(MonopolyBankerGameState.WaitingForPlayers, DateTime.UtcNow.AddHours(-3))
        };

        // Act
        var result = MonopolyBankerGameService.WhereDueForCleanup(games).ToList();

        // Assert
        result.ShouldBeEmpty();
    }

    [Fact]
    public void WhereDueForCleanup_InProgressOlderThan7Days_IsMarkedForCleanup()
    {
        // Arrange
        var games = new List<Game>
        {
            CreateGame(MonopolyBankerGameState.InProgress, DateTime.UtcNow.AddDays(-8))
        };

        // Act
        var result = MonopolyBankerGameService.WhereDueForCleanup(games).ToList();

        // Assert
        result.Count.ShouldBe(1);
    }

    [Fact]
    public void WhereDueForCleanup_InProgressNewerThan7Days_IsNotMarkedForCleanup()
    {
        // Arrange
        var games = new List<Game>
        {
            CreateGame(MonopolyBankerGameState.InProgress, DateTime.UtcNow.AddDays(-6))
        };

        // Act
        var result = MonopolyBankerGameService.WhereDueForCleanup(games).ToList();

        // Assert
        result.ShouldBeEmpty();
    }

    [Fact]
    public void WhereDueForCleanup_CompletedOlderThan1Day_IsMarkedForCleanup()
    {
        // Arrange
        var games = new List<Game>
        {
            CreateGame(MonopolyBankerGameState.Completed, DateTime.UtcNow.AddDays(-2))
        };

        // Act
        var result = MonopolyBankerGameService.WhereDueForCleanup(games).ToList();

        // Assert
        result.Count.ShouldBe(1);
    }

    [Fact]
    public void WhereDueForCleanup_CompletedNewerThan1Day_IsNotMarkedForCleanup()
    {
        // Arrange
        var games = new List<Game>
        {
            CreateGame(MonopolyBankerGameState.Completed, DateTime.UtcNow.AddHours(-12))
        };

        // Act
        var result = MonopolyBankerGameService.WhereDueForCleanup(games).ToList();

        // Assert
        result.ShouldBeEmpty();
    }

    [Fact]
    public void WhereDueForCleanup_MixedGames_ReturnsOnlyDueForCleanup()
    {
        // Arrange
        var games = new List<Game>
        {
            // Should be cleaned up
            CreateGame(MonopolyBankerGameState.WaitingForPlayers, DateTime.UtcNow.AddHours(-5)),
            CreateGame(MonopolyBankerGameState.InProgress, DateTime.UtcNow.AddDays(-8)),
            CreateGame(MonopolyBankerGameState.Completed, DateTime.UtcNow.AddDays(-2)),
            
            // Should NOT be cleaned up
            CreateGame(MonopolyBankerGameState.WaitingForPlayers, DateTime.UtcNow.AddHours(-3)),
            CreateGame(MonopolyBankerGameState.InProgress, DateTime.UtcNow.AddDays(-6)),
            CreateGame(MonopolyBankerGameState.Completed, DateTime.UtcNow.AddHours(-12))
        };

        // Act
        var result = MonopolyBankerGameService.WhereDueForCleanup(games).ToList();

        // Assert
        result.Count.ShouldBe(3);
        result.ShouldContain(g => g.State == MonopolyBankerGameState.WaitingForPlayers && g.UpdatedUTC < DateTime.UtcNow.AddHours(-4));
        result.ShouldContain(g => g.State == MonopolyBankerGameState.InProgress && g.UpdatedUTC < DateTime.UtcNow.AddDays(-7));
        result.ShouldContain(g => g.State == MonopolyBankerGameState.Completed && g.UpdatedUTC < DateTime.UtcNow.AddDays(-1));
    }

    [Fact]
    public void WhereDueForCleanup_EmptyList_ReturnsEmpty()
    {
        // Arrange
        var games = new List<Game>();

        // Act
        var result = MonopolyBankerGameService.WhereDueForCleanup(games).ToList();

        // Assert
        result.ShouldBeEmpty();
    }

    [Fact]
    public void WhereDueForCleanup_AllRecentGames_ReturnsEmpty()
    {
        // Arrange
        var games = new List<Game>
        {
            CreateGame(MonopolyBankerGameState.WaitingForPlayers, DateTime.UtcNow.AddMinutes(-30)),
            CreateGame(MonopolyBankerGameState.InProgress, DateTime.UtcNow.AddDays(-1)),
            CreateGame(MonopolyBankerGameState.Completed, DateTime.UtcNow.AddHours(-6))
        };

        // Act
        var result = MonopolyBankerGameService.WhereDueForCleanup(games).ToList();

        // Assert
        result.ShouldBeEmpty();
    }

    [Fact]
    public void IsDueForCleanupExpression_WaitingForPlayersOlderThan4Hours_ReturnsTrue()
    {
        // Arrange
        var game = CreateGame(MonopolyBankerGameState.WaitingForPlayers, DateTime.UtcNow.AddHours(-5));
        var expression = MonopolyBankerGameService.IsDueForCleanupExpression().Compile();

        // Act
        var result = expression(game);

        // Assert
        result.ShouldBeTrue();
    }

    [Fact]
    public void IsDueForCleanupExpression_WaitingForPlayersNewerThan4Hours_ReturnsFalse()
    {
        // Arrange
        var game = CreateGame(MonopolyBankerGameState.WaitingForPlayers, DateTime.UtcNow.AddHours(-3));
        var expression = MonopolyBankerGameService.IsDueForCleanupExpression().Compile();

        // Act
        var result = expression(game);

        // Assert
        result.ShouldBeFalse();
    }

    [Fact]
    public void IsDueForCleanupExpression_InProgressOlderThan7Days_ReturnsTrue()
    {
        // Arrange
        var game = CreateGame(MonopolyBankerGameState.InProgress, DateTime.UtcNow.AddDays(-8));
        var expression = MonopolyBankerGameService.IsDueForCleanupExpression().Compile();

        // Act
        var result = expression(game);

        // Assert
        result.ShouldBeTrue();
    }

    [Fact]
    public void IsDueForCleanupExpression_InProgressNewerThan7Days_ReturnsFalse()
    {
        // Arrange
        var game = CreateGame(MonopolyBankerGameState.InProgress, DateTime.UtcNow.AddDays(-6));
        var expression = MonopolyBankerGameService.IsDueForCleanupExpression().Compile();

        // Act
        var result = expression(game);

        // Assert
        result.ShouldBeFalse();
    }

    [Fact]
    public void IsDueForCleanupExpression_CompletedOlderThan1Day_ReturnsTrue()
    {
        // Arrange
        var game = CreateGame(MonopolyBankerGameState.Completed, DateTime.UtcNow.AddDays(-2));
        var expression = MonopolyBankerGameService.IsDueForCleanupExpression().Compile();

        // Act
        var result = expression(game);

        // Assert
        result.ShouldBeTrue();
    }

    [Fact]
    public void IsDueForCleanupExpression_CompletedNewerThan1Day_ReturnsFalse()
    {
        // Arrange
        var game = CreateGame(MonopolyBankerGameState.Completed, DateTime.UtcNow.AddHours(-12));
        var expression = MonopolyBankerGameService.IsDueForCleanupExpression().Compile();

        // Act
        var result = expression(game);

        // Assert
        result.ShouldBeFalse();
    }

    private static Game CreateGame(MonopolyBankerGameState state, DateTime updatedUTC)
    {
        return new Game
        {
            ID = ObjectId.GenerateNewId(),
            ExternalID = Guid.NewGuid().ToString(),
            Label = "Test Game",
            State = state,
            Players = new List<Player>(),
            Options = new Options
            {
                MoneyOnFreeParking = false,
                DoubleMoneyOnGo = false
            },
            CreatedUTC = DateTime.UtcNow.AddDays(-30),
            UpdatedUTC = updatedUTC,
            GameOwnerPlayerID = null
        };
    }
}
