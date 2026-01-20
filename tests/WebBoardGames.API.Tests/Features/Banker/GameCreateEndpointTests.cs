using Bogus;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using WebBoardGames.API.Tests.Fixtures;
using WebBoardGames.Monopoly.Features.Banker.GameCreate;

namespace WebBoardGames.API.Tests.Features.Banker;

public class GameCreateEndpointTests(WebApplicationFixture fixture) : IntegrationTestBase(fixture)
{
    private readonly Faker _faker = new();

    [Fact]
    public async Task GameCreate_WithValidRequest_CreatesGameSuccessfully()
    {
        var request = new GameCreateRequest(
            Label: _faker.Lorem.Sentence(3),
            PlayerName: _faker.Name.FirstName(),
            MoneyOnFreeParking: false,
            DoubleMoneyOnGo: false
        );

        var result = await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/create");
            s.StatusCodeShouldBe(200);
        });

        var response = await result.ReadAsJsonAsync<GameCreateResponse>();
        response.ShouldNotBeNull();
        response.GameID.ShouldNotBeNullOrEmpty();
        response.PlayerID.ShouldNotBeNullOrEmpty();

        var context = GetDbContext();
        var game = await context.MonopolyBankerGames
            .FirstOrDefaultAsync(g => g.ExternalID == response.GameID, TestContext.Current.CancellationToken);

        game.ShouldNotBeNull();
        game.Label.ShouldBe(request.Label);
        game.Players.Count.ShouldBe(1);
        game.Players[0].Name.ShouldBe(request.PlayerName);
        game.Players[0].Balance.ShouldBe(1500);
        game.Options.MoneyOnFreeParking.ShouldBe(false);
        game.Options.DoubleMoneyOnGo.ShouldBe(false);
    }

    [Fact]
    public async Task GameCreate_WithMoneyOnFreeParking_CreatesFreeParkinPlayer()
    {
        var request = new GameCreateRequest(
            Label: _faker.Lorem.Sentence(3),
            PlayerName: _faker.Name.FirstName(),
            MoneyOnFreeParking: true,
            DoubleMoneyOnGo: false
        );

        var result = await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/create");
            s.StatusCodeShouldBe(200);
        });

        var response = await result.ReadAsJsonAsync<GameCreateResponse>();
        var context = GetDbContext();
        var game = await context.MonopolyBankerGames
            .FirstOrDefaultAsync(g => g.ExternalID == response!.GameID, TestContext.Current.CancellationToken);

        game.ShouldNotBeNull();
        game.Players.Count.ShouldBe(2);
        game.Players.Any(p => p.ExternalID == "free-parking").ShouldBeTrue();
        game.Players.First(p => p.ExternalID == "free-parking").Balance.ShouldBe(0);
    }

    [Fact]
    public async Task GameCreate_WithEmptyLabel_ReturnsBadRequest()
    {
        var request = new GameCreateRequest(
            Label: "",
            PlayerName: _faker.Name.FirstName(),
            MoneyOnFreeParking: false,
            DoubleMoneyOnGo: false
        );

        await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/create");
            s.StatusCodeShouldBe(400);
        });
    }

    [Fact]
    public async Task GameCreate_WithEmptyPlayerName_ReturnsBadRequest()
    {
        var request = new GameCreateRequest(
            Label: _faker.Lorem.Sentence(3),
            PlayerName: "",
            MoneyOnFreeParking: false,
            DoubleMoneyOnGo: false
        );

        await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/create");
            s.StatusCodeShouldBe(400);
        });
    }

    [Fact]
    public async Task GameCreate_WithDoubleMoneyOnGo_SetsOptionsCorrectly()
    {
        var request = new GameCreateRequest(
            Label: _faker.Lorem.Sentence(3),
            PlayerName: _faker.Name.FirstName(),
            MoneyOnFreeParking: false,
            DoubleMoneyOnGo: true
        );

        var result = await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/create");
            s.StatusCodeShouldBe(200);
        });

        var response = await result.ReadAsJsonAsync<GameCreateResponse>();
        var context = GetDbContext();
        var game = await context.MonopolyBankerGames
            .FirstOrDefaultAsync(g => g.ExternalID == response!.GameID, TestContext.Current.CancellationToken);

        game.ShouldNotBeNull();
        game.Options.DoubleMoneyOnGo.ShouldBeTrue();
    }

    [Theory]
    [InlineData(true, true)]
    [InlineData(true, false)]
    [InlineData(false, true)]
    [InlineData(false, false)]
    public async Task GameCreate_WithDifferentOptions_CreatesGameWithCorrectOptions(bool moneyOnFreeParking, bool doubleMoneyOnGo)
    {
        var request = new GameCreateRequest(
            Label: _faker.Lorem.Sentence(3),
            PlayerName: _faker.Name.FirstName(),
            MoneyOnFreeParking: moneyOnFreeParking,
            DoubleMoneyOnGo: doubleMoneyOnGo
        );

        var result = await Host.Scenario(s =>
        {
            s.Post.Json(request).ToUrl("/api/monopoly/banker/create");
            s.StatusCodeShouldBe(200);
        });

        var response = await result.ReadAsJsonAsync<GameCreateResponse>();
        var context = GetDbContext();
        var game = await context.MonopolyBankerGames
            .FirstOrDefaultAsync(g => g.ExternalID == response!.GameID, TestContext.Current.CancellationToken);

        game.ShouldNotBeNull();
        game.Options.MoneyOnFreeParking.ShouldBe(moneyOnFreeParking);
        game.Options.DoubleMoneyOnGo.ShouldBe(doubleMoneyOnGo);
    }
}
