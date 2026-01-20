using Bogus;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;
using Shouldly;
using WebBoardGames.API.Tests.Fixtures;
using WebBoardGames.Monopoly.Features.Banker.PaymentExecute;
using WebBoardGames.Persistence.Entities.Monopoly.Banker;

namespace WebBoardGames.API.Tests.Features.Banker;

public class PaymentExecuteEndpointTests(WebApplicationFixture fixture) : IntegrationTestBase(fixture)
{
    private readonly Faker _faker = new();

    [Fact]
    public async Task PaymentExecute_TransferBetweenPlayers_UpdatesBalancesCorrectly()
    {
        var context = GetDbContext();
        var game = CreateTestGameWithMultiplePlayers();
        context.MonopolyBankerGames.Add(game);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var sourcePlayer = game.Players[0];
        var targetPlayer = game.Players[1];
        var amount = 200;

        var request = new PaymentExecuteRequest(
            game.ExternalID,
            sourcePlayer.ExternalID,
            targetPlayer.ExternalID,
            amount
        );

        await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/payment");
            s.StatusCodeShouldBe(204);
        });

        var updatedGame = await GetDbContext(forAssert: true).MonopolyBankerGames
            .FirstOrDefaultAsync(g => g.ExternalID == game.ExternalID, TestContext.Current.CancellationToken);
        updatedGame.ShouldNotBeNull();

        var updatedSource = updatedGame.Players.First(p => p.ExternalID == sourcePlayer.ExternalID);
        var updatedTarget = updatedGame.Players.First(p => p.ExternalID == targetPlayer.ExternalID);

        updatedSource.Balance.ShouldBe(sourcePlayer.Balance - amount);
        updatedTarget.Balance.ShouldBe(targetPlayer.Balance + amount);
    }

    [Fact]
    public async Task PaymentExecute_WithOnlySource_DecreasesSourceBalance()
    {
        var context = GetDbContext();
        var game = CreateTestGameWithMultiplePlayers();
        context.MonopolyBankerGames.Add(game);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var sourcePlayer = game.Players[0];
        var amount = 100;

        var request = new PaymentExecuteRequest(
            game.ExternalID,
            sourcePlayer.ExternalID,
            null,
            amount
        );

        await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/payment");
            s.StatusCodeShouldBe(204);
        });

        var updatedGame = await GetDbContext(forAssert: true).MonopolyBankerGames
            .FirstOrDefaultAsync(g => g.ExternalID == game.ExternalID, TestContext.Current.CancellationToken);
        var updatedSource = updatedGame!.Players.First(p => p.ExternalID == sourcePlayer.ExternalID);
        updatedSource.Balance.ShouldBe(sourcePlayer.Balance - amount);
    }

    [Fact]
    public async Task PaymentExecute_WithOnlyTarget_IncreasesTargetBalance()
    {
        var context = GetDbContext();
        var game = CreateTestGameWithMultiplePlayers();
        context.MonopolyBankerGames.Add(game);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var targetPlayer = game.Players[0];
        var amount = 200;

        var request = new PaymentExecuteRequest(
            game.ExternalID,
            null,
            targetPlayer.ExternalID,
            amount
        );

        await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/payment");
            s.StatusCodeShouldBe(204);
        });

        var updatedGame = await GetDbContext(forAssert: true).MonopolyBankerGames
            .FirstOrDefaultAsync(g => g.ExternalID == game.ExternalID, TestContext.Current.CancellationToken);
        var updatedTarget = updatedGame!.Players.First(p => p.ExternalID == targetPlayer.ExternalID);
        updatedTarget.Balance.ShouldBe(targetPlayer.Balance + amount);
    }

    [Fact]
    public async Task PaymentExecute_WithNonExistentGame_ReturnsNotFound()
    {
        var request = new PaymentExecuteRequest(
            "NONEXISTENT",
            null,
            null,
            100
        );

        await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/payment");
            s.StatusCodeShouldBe(404);
        });
    }

    [Fact]
    public async Task PaymentExecute_WithZeroAmount_ReturnsBadRequest()
    {
        var context = GetDbContext();
        var game = CreateTestGameWithMultiplePlayers();
        context.MonopolyBankerGames.Add(game);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var request = new PaymentExecuteRequest(
            game.ExternalID,
            game.Players[0].ExternalID,
            game.Players[1].ExternalID,
            0
        );

        await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/payment");
            s.StatusCodeShouldBe(400);
        });
    }

    [Fact]
    public async Task PaymentExecute_TransferMoreThanSourceBalance_TransfersOnlyAvailableAmount()
    {
        var context = GetDbContext();
        var game = CreateTestGameWithMultiplePlayers();
        var sourcePlayer = game.Players[0];
        var targetPlayer = game.Players[1];
        sourcePlayer.Balance = 200;
        targetPlayer.Balance = 1000;
        context.MonopolyBankerGames.Add(game);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var request = new PaymentExecuteRequest(
            game.ExternalID,
            sourcePlayer.ExternalID,
            targetPlayer.ExternalID,
            500 // Attempt to transfer more than available
        );

        await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/payment");
            s.StatusCodeShouldBe(204);
        });

        var updatedGame = await GetDbContext(forAssert: true).MonopolyBankerGames
            .FirstOrDefaultAsync(g => g.ExternalID == game.ExternalID, TestContext.Current.CancellationToken);
        updatedGame.ShouldNotBeNull();

        var updatedSource = updatedGame.Players.First(p => p.ExternalID == sourcePlayer.ExternalID);
        var updatedTarget = updatedGame.Players.First(p => p.ExternalID == targetPlayer.ExternalID);

        updatedSource.Balance.ShouldBe(0);
        updatedTarget.Balance.ShouldBe(1200);
    }


    [Fact]
    public async Task PaymentExecute_WhenOnlyOnePlayerSolvent_CompletesGame()
    {
        var context = GetDbContext();
        var game = CreateTestGameWithMultiplePlayers();
        game.Players[0].Balance = 100;
        game.Players[1].Balance = 0;
        context.MonopolyBankerGames.Add(game);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var request = new PaymentExecuteRequest(
            game.ExternalID,
            game.Players[0].ExternalID,
            null,
            100
        );

        await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/payment");
            s.StatusCodeShouldBe(204);
        });

        var updatedGame = await GetDbContext(forAssert: true).MonopolyBankerGames
            .FirstOrDefaultAsync(g => g.ExternalID == game.ExternalID, TestContext.Current.CancellationToken);
        updatedGame!.State.ShouldBe(MonopolyBankerGameState.Completed);
    }

    [Fact]
    public async Task PaymentExecute_WithCompletedGame_DoesNothing()
    {
        var context = GetDbContext();
        var game = CreateTestGameWithMultiplePlayers();
        game.State = MonopolyBankerGameState.Completed;
        var originalBalance = game.Players[0].Balance;
        context.MonopolyBankerGames.Add(game);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var request = new PaymentExecuteRequest(
            game.ExternalID,
            game.Players[0].ExternalID,
            null,
            100
        );

        await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/payment");
            s.StatusCodeShouldBe(204);
        });

        var updatedGame = await context.MonopolyBankerGames
            .FirstOrDefaultAsync(g => g.ExternalID == game.ExternalID, TestContext.Current.CancellationToken);
        updatedGame!.Players[0].Balance.ShouldBe(originalBalance);
    }

    [Fact]
    public async Task PaymentExecute_IgnoresFreeParking_WhenDeterminingGameCompletion()
    {
        var context = GetDbContext();
        var game = CreateTestGameWithMultiplePlayers();
        game.Players.Add(new Player
        {
            ID = ObjectId.GenerateNewId(),
            ExternalID = "free-parking",
            Name = "Free Parking",
            Balance = 500
        });
        game.Players[0].Balance = 100;
        game.Players[1].Balance = 0;
        context.MonopolyBankerGames.Add(game);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var request = new PaymentExecuteRequest(
            game.ExternalID,
            game.Players[0].ExternalID,
            null,
            100
        );

        await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/payment");
            s.StatusCodeShouldBe(204);
        });

        var updatedGame = await GetDbContext(forAssert: true).MonopolyBankerGames
            .FirstOrDefaultAsync(g => g.ExternalID == game.ExternalID, TestContext.Current.CancellationToken);
        updatedGame!.State.ShouldBe(MonopolyBankerGameState.Completed);
    }

    private Game CreateTestGameWithMultiplePlayers()
    {
        return new Game
        {
            ID = ObjectId.GenerateNewId(),
            ExternalID = Guid.NewGuid().ToString()[0..8].ToUpperInvariant(),
            Label = _faker.Lorem.Sentence(3),
            State = MonopolyBankerGameState.InProgress,
            Options = new Options
            {
                DoubleMoneyOnGo = false,
                MoneyOnFreeParking = false
            },
            Players =
            [
                new()
                {
                    ID = ObjectId.GenerateNewId(),
                    ExternalID = Guid.NewGuid().ToString()[0..8].ToUpperInvariant(),
                    Name = _faker.Name.FirstName(),
                    Balance = 1500
                },
                new()
                {
                    ID = ObjectId.GenerateNewId(),
                    ExternalID = Guid.NewGuid().ToString()[0..8].ToUpperInvariant(),
                    Name = _faker.Name.FirstName(),
                    Balance = 1000
                }
            ],
            CreatedUTC = DateTime.UtcNow,
            UpdatedUTC = DateTime.UtcNow,
            GameOwnerPlayerID = null
        };
    }
}
