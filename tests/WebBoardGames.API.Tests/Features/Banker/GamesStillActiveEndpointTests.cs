using Bogus;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using WebBoardGames.API.Tests.Fixtures;
using WebBoardGames.Monopoly.Features.Banker.GameCreate;
using WebBoardGames.Monopoly.Features.Banker.GamesStillActive;
using WebBoardGames.Persistence.Entities.Monopoly.Banker;

namespace WebBoardGames.API.Tests.Features.Banker;

public class GamesStillActiveEndpointTests(WebApplicationFixture fixture) : IntegrationTestBase(fixture)
{
    private readonly Faker _faker = new();

    [Fact]
    public async Task GamesStillActive_WithEmptyList_ReturnsEmptyDictionary()
    {
        var request = new GamesStillActiveRequest(new List<string>());

        var result = await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/still-active");
            s.StatusCodeShouldBe(200);
        });

        var response = await result.ReadAsJsonAsync<GamesStillActiveResponse>();
        response.ShouldNotBeNull();
        response.GameIdStatus.ShouldBeEmpty();
    }

    [Fact]
    public async Task GamesStillActive_WithSingleActiveGame_ReturnsTrue()
    {
        // Create a game
        var createRequest = new GameCreateRequest(
            Label: _faker.Lorem.Sentence(3),
            PlayerName: _faker.Name.FirstName(),
            MoneyOnFreeParking: false,
            DoubleMoneyOnGo: false
        );

        var createResult = await Host.Scenario(s =>
        {
            s.Post.Json(createRequest).ToUrl("/api/monopoly/banker/create");
            s.StatusCodeShouldBe(200);
        });

        var createResponse = await createResult.ReadAsJsonAsync<GameCreateResponse>();
        var gameID = createResponse!.GameID;

        // Check if game is still active
        var request = new GamesStillActiveRequest(new List<string> { gameID });

        var result = await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/still-active");
            s.StatusCodeShouldBe(200);
        });

        var response = await result.ReadAsJsonAsync<GamesStillActiveResponse>();
        response.ShouldNotBeNull();
        response.GameIdStatus.ShouldContainKey(gameID);
        response.GameIdStatus[gameID].ShouldBeTrue();
    }

    [Fact]
    public async Task GamesStillActive_WithCompletedGame_ReturnsFalse()
    {
        // Create a game
        var createRequest = new GameCreateRequest(
            Label: _faker.Lorem.Sentence(3),
            PlayerName: _faker.Name.FirstName(),
            MoneyOnFreeParking: false,
            DoubleMoneyOnGo: false
        );

        var createResult = await Host.Scenario(s =>
        {
            s.Post.Json(createRequest).ToUrl("/api/monopoly/banker/create");
            s.StatusCodeShouldBe(200);
        });

        var createResponse = await createResult.ReadAsJsonAsync<GameCreateResponse>();
        var gameID = createResponse!.GameID;

        // Mark game as completed
        var context = GetDbContext();
        var game = await context.MonopolyBankerGames
            .FirstOrDefaultAsync(g => g.ExternalID == gameID, TestContext.Current.CancellationToken);
        game.ShouldNotBeNull();
        game.State = MonopolyBankerGameState.Completed;
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Check if game is still active
        var request = new GamesStillActiveRequest(new List<string> { gameID });

        var result = await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/still-active");
            s.StatusCodeShouldBe(200);
        });

        var response = await result.ReadAsJsonAsync<GamesStillActiveResponse>();
        response.ShouldNotBeNull();
        response.GameIdStatus.ShouldContainKey(gameID);
        response.GameIdStatus[gameID].ShouldBeFalse();
    }

    [Fact]
    public async Task GamesStillActive_WithMultipleGames_ReturnsCorrectStatus()
    {
        // Create first game (will be active)
        var createRequest1 = new GameCreateRequest(
            Label: _faker.Lorem.Sentence(3),
            PlayerName: _faker.Name.FirstName(),
            MoneyOnFreeParking: false,
            DoubleMoneyOnGo: false
        );

        var createResult1 = await Host.Scenario(s =>
        {
            s.Post.Json(createRequest1).ToUrl("/api/monopoly/banker/create");
            s.StatusCodeShouldBe(200);
        });

        var createResponse1 = await createResult1.ReadAsJsonAsync<GameCreateResponse>();
        var gameID1 = createResponse1!.GameID;

        // Create second game (will be completed)
        var createRequest2 = new GameCreateRequest(
            Label: _faker.Lorem.Sentence(3),
            PlayerName: _faker.Name.FirstName(),
            MoneyOnFreeParking: false,
            DoubleMoneyOnGo: false
        );

        var createResult2 = await Host.Scenario(s =>
        {
            s.Post.Json(createRequest2).ToUrl("/api/monopoly/banker/create");
            s.StatusCodeShouldBe(200);
        });

        var createResponse2 = await createResult2.ReadAsJsonAsync<GameCreateResponse>();
        var gameID2 = createResponse2!.GameID;

        // Mark second game as completed
        var context = GetDbContext();
        var game2 = await context.MonopolyBankerGames
            .FirstOrDefaultAsync(g => g.ExternalID == gameID2, TestContext.Current.CancellationToken);
        game2.ShouldNotBeNull();
        game2.State = MonopolyBankerGameState.Completed;
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Check both games
        var request = new GamesStillActiveRequest(new List<string> { gameID1, gameID2 });

        var result = await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/still-active");
            s.StatusCodeShouldBe(200);
        });

        var response = await result.ReadAsJsonAsync<GamesStillActiveResponse>();
        response.ShouldNotBeNull();
        response.GameIdStatus.Count.ShouldBe(2);
        response.GameIdStatus[gameID1].ShouldBeTrue();
        response.GameIdStatus[gameID2].ShouldBeFalse();
    }

    [Fact]
    public async Task GamesStillActive_WithNonExistentGameID_ReturnsFalse()
    {
        var nonExistentGameID = "nonexistent-game-id";
        var request = new GamesStillActiveRequest(new List<string> { nonExistentGameID });

        var result = await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/still-active");
            s.StatusCodeShouldBe(200);
        });

        var response = await result.ReadAsJsonAsync<GamesStillActiveResponse>();
        response.ShouldNotBeNull();
        response.GameIdStatus.ShouldContainKey(nonExistentGameID);
        response.GameIdStatus[nonExistentGameID].ShouldBeFalse();
    }

    [Fact]
    public async Task GamesStillActive_WithMixedExistingAndNonExisting_ReturnsCorrectStatus()
    {
        // Create a game
        var createRequest = new GameCreateRequest(
            Label: _faker.Lorem.Sentence(3),
            PlayerName: _faker.Name.FirstName(),
            MoneyOnFreeParking: false,
            DoubleMoneyOnGo: false
        );

        var createResult = await Host.Scenario(s =>
        {
            s.Post.Json(createRequest).ToUrl("/api/monopoly/banker/create");
            s.StatusCodeShouldBe(200);
        });

        var createResponse = await createResult.ReadAsJsonAsync<GameCreateResponse>();
        var existingGameID = createResponse!.GameID;
        var nonExistentGameID = "nonexistent-game-id";

        // Check both existing and non-existing game
        var request = new GamesStillActiveRequest(new List<string> { existingGameID, nonExistentGameID });

        var result = await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/still-active");
            s.StatusCodeShouldBe(200);
        });

        var response = await result.ReadAsJsonAsync<GamesStillActiveResponse>();
        response.ShouldNotBeNull();
        response.GameIdStatus.Count.ShouldBe(2);
        response.GameIdStatus[existingGameID].ShouldBeTrue();
        response.GameIdStatus[nonExistentGameID].ShouldBeFalse();
    }
}
