using Bogus;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;
using Shouldly;
using WebBoardGames.API.Tests.Fixtures;
using WebBoardGames.Monopoly.Features.Banker.GameJoin;
using WebBoardGames.Persistence.Entities.Monopoly.Banker;

namespace WebBoardGames.API.Tests.Features.Banker;

public class GameJoinEndpointTests : IntegrationTestBase
{
    private readonly Faker _faker = new();

    public GameJoinEndpointTests(WebApplicationFixture fixture) : base(fixture)
    {
    }

    [Fact]
    public async Task GameJoin_WithValidGameAndUniqueName_AddsPlayerSuccessfully()
    {
        var context = GetDbContext();
        var game = CreateTestGame();
        context.MonopolyBankerGames.Add(game);
        await context.SaveChangesAsync();

        var playerName = _faker.Name.FirstName();
        var request = new GameJoinRequest(game.ExternalID, playerName);

        var result = await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/join");
            s.StatusCodeShouldBe(200);
        });

        var response = await result.ReadAsJsonAsync<GameJoinResponse>();
        response.ShouldNotBeNull();
        response.Exists.ShouldBeTrue();
        response.AlreadyInProgress.ShouldBeFalse();
        response.PlayerID.ShouldNotBeNullOrEmpty();

        var updatedGame = await context.MonopolyBankerGames
            .FirstOrDefaultAsync(g => g.ExternalID == game.ExternalID);
        updatedGame!.Players.Count.ShouldBe(2);
        updatedGame.Players.Any(p => p.Name == playerName).ShouldBeTrue();
    }

    [Fact]
    public async Task GameJoin_WithDuplicateName_AddsSuffixToName()
    {
        var context = GetDbContext();
        var existingPlayerName = "John";
        var game = CreateTestGame(existingPlayerName);
        context.MonopolyBankerGames.Add(game);
        await context.SaveChangesAsync();

        var request = new GameJoinRequest(game.ExternalID, existingPlayerName);

        var result = await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/join");
            s.StatusCodeShouldBe(200);
        });

        var response = await result.ReadAsJsonAsync<GameJoinResponse>();
        response.ShouldNotBeNull();
        response.PlayerID.ShouldNotBeNullOrEmpty();

        var updatedGame = await context.MonopolyBankerGames
            .FirstOrDefaultAsync(g => g.ExternalID == game.ExternalID);
        updatedGame!.Players.Count.ShouldBe(2);
        updatedGame.Players.Any(p => p.Name == "John (1)").ShouldBeTrue();
    }

    [Fact]
    public async Task GameJoin_WithMultipleDuplicateNames_IncrementsSuffixCorrectly()
    {
        var context = GetDbContext();
        var baseName = "Alice";
        var game = CreateTestGame(baseName);
        game.Players.Add(new Player
        {
            ID = ObjectId.GenerateNewId(),
            ExternalID = Guid.NewGuid().ToString()[0..8],
            Name = $"{baseName} (1)",
            Balance = 1500
        });
        context.MonopolyBankerGames.Add(game);
        await context.SaveChangesAsync();

        var request = new GameJoinRequest(game.ExternalID, baseName);

        var result = await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/join");
            s.StatusCodeShouldBe(200);
        });

        var response = await result.ReadAsJsonAsync<GameJoinResponse>();
        var updatedGame = await context.MonopolyBankerGames
            .FirstOrDefaultAsync(g => g.ExternalID == game.ExternalID);
        updatedGame!.Players.Count.ShouldBe(3);
        updatedGame.Players.Any(p => p.Name == "Alice (2)").ShouldBeTrue();
    }

    [Fact]
    public async Task GameJoin_WithNonExistentGame_ReturnsExistsFalse()
    {
        var request = new GameJoinRequest("NONEXISTENT", _faker.Name.FirstName());

        var result = await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/join");
            s.StatusCodeShouldBe(200);
        });

        var response = await result.ReadAsJsonAsync<GameJoinResponse>();
        response.ShouldNotBeNull();
        response.Exists.ShouldBeFalse();
        response.AlreadyInProgress.ShouldBeFalse();
        response.PlayerID.ShouldBeNull();
    }

    [Fact]
    public async Task GameJoin_WithGameInProgress_ReturnsAlreadyInProgress()
    {
        var context = GetDbContext();
        var game = CreateTestGame();
        game.State = MonopolyBankerGameState.InProgress;
        context.MonopolyBankerGames.Add(game);
        await context.SaveChangesAsync();

        var request = new GameJoinRequest(game.ExternalID, _faker.Name.FirstName());

        var result = await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/join");
            s.StatusCodeShouldBe(200);
        });

        var response = await result.ReadAsJsonAsync<GameJoinResponse>();
        response.ShouldNotBeNull();
        response.Exists.ShouldBeTrue();
        response.AlreadyInProgress.ShouldBeTrue();
        response.PlayerID.ShouldBeNull();
    }

    [Fact]
    public async Task GameJoin_WithEmptyPlayerName_ReturnsBadRequest()
    {
        var context = GetDbContext();
        var game = CreateTestGame();
        context.MonopolyBankerGames.Add(game);
        await context.SaveChangesAsync();

        var request = new GameJoinRequest(game.ExternalID, "");

        await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/join");
            s.StatusCodeShouldBe(400);
        });
    }

    [Fact]
    public async Task GameJoin_TrimsPlayerName_BeforeCheckingForDuplicates()
    {
        var context = GetDbContext();
        var game = CreateTestGame("TestPlayer");
        context.MonopolyBankerGames.Add(game);
        await context.SaveChangesAsync();

        var request = new GameJoinRequest(game.ExternalID, "  TestPlayer  ");

        var result = await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/join");
            s.StatusCodeShouldBe(200);
        });

        var response = await result.ReadAsJsonAsync<GameJoinResponse>();
        var updatedGame = await context.MonopolyBankerGames
            .FirstOrDefaultAsync(g => g.ExternalID == game.ExternalID);
        updatedGame!.Players.Any(p => p.Name == "TestPlayer (1)").ShouldBeTrue();
    }

    private Game CreateTestGame(string? initialPlayerName = null)
    {
        return new Game
        {
            ID = ObjectId.GenerateNewId(),
            ExternalID = Guid.NewGuid().ToString()[0..8].ToUpperInvariant(),
            Label = _faker.Lorem.Sentence(3),
            State = MonopolyBankerGameState.WaitingForPlayers,
            Options = new Options
            {
                DoubleMoneyOnGo = false,
                MoneyOnFreeParking = false
            },
            Players = new List<Player>
            {
                new()
                {
                    ID = ObjectId.GenerateNewId(),
                    ExternalID = Guid.NewGuid().ToString()[0..8].ToUpperInvariant(),
                    Name = initialPlayerName ?? _faker.Name.FirstName(),
                    Balance = 1500
                }
            },
            CreatedUTC = DateTime.UtcNow,
            UpdatedUTC = DateTime.UtcNow,
            GameOwnerPlayerID = null
        };
    }
}
