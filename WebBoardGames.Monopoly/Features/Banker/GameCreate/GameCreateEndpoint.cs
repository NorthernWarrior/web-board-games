using FastEndpoints;
using Microsoft.AspNetCore.Builder;
using MongoDB.Bson;
using WebBoardGames.Persistence;
using WebBoardGames.Persistence.Entities.Monopoly.Banker;

namespace WebBoardGames.Monopoly.Features.Banker.GameCreate;

public class GameCreateEndpoint(BoardGamesDbContext _context) : Endpoint<GameCreateRequest, GameCreateResponse>
{
    public override void Configure()
    {
        Post("/create");
        Group<BankerGroup>();
        AllowAnonymous();
        Options(x => x.RequireRateLimiting("GameCreatePolicy"));
    }

    public override async Task HandleAsync(GameCreateRequest req, CancellationToken ct)
    {
        var player = new Player()
        {
            ID = ObjectId.GenerateNewId(),
            ExternalID = Guid.NewGuid().ToString()[0..8].ToUpperInvariant(),
            Name = req.PlayerName.Trim(),
            Balance = 1500,
        };

        var game = new Game()
        {
            ID = ObjectId.GenerateNewId(),
            ExternalID = Guid.NewGuid().ToString()[0..8].ToUpperInvariant(),
            Label = req.Label.Trim(),
            State = MonopolyBankerGameState.WaitingForPlayers,
            Options = new()
            {
                DoubleMoneyOnGo = req.DoubleMoneyOnGo,
                MoneyOnFreeParking = req.MoneyOnFreeParking
            },
            Players = new(2),
            CreatedUTC = DateTime.UtcNow,
            UpdatedUTC = DateTime.UtcNow,
        };
        if (req.MoneyOnFreeParking)
        {
            game.Players.Add(new()
            {
                ID = ObjectId.GenerateNewId(),
                ExternalID = "free-parking",
                Name = "Free Parking",
                Balance = 0,
            });
        }
        game.Players.Add(player);

        _context.MonopolyBankerGames.Add(game);
        await _context.SaveChangesAsync(ct);

        Response = new(game.ExternalID, player.ExternalID);
    }
}
