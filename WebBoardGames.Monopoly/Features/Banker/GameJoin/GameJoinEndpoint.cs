using FastEndpoints;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;
using WebBoardGames.Monopoly.Services;
using WebBoardGames.Persistence;
using WebBoardGames.Persistence.Entities.Monopoly.Banker;

namespace WebBoardGames.Monopoly.Features.Banker.GameJoin;

public partial class GameJoinEndpoint(BoardGamesDbContext _context, MonopolyBankerGameDataChangedEventService _eventService) : Endpoint<GameJoinRequest, GameJoinResponse>
{

    public override void Configure()
    {
        Post("/join");
        Group<BankerGroup>();
        AllowAnonymous();
        Options(x => x.RequireRateLimiting("GameJoinPolicy"));
    }

    public override async Task HandleAsync(GameJoinRequest req, CancellationToken ct)
    {
        var game = await _context.MonopolyBankerGames
            .Where(g => g.ExternalID == req.GameID)
            .FirstOrDefaultAsync(ct);

        if (game is null)
        {
            Response = new(false, false, null);
            return;
        }
        else if (game.State != MonopolyBankerGameState.WaitingForPlayers)
        {
            Response = new(true, true, null);
            return;
        }

        var playerName = _HandlePlayerNameDuplicates(game.Players, req.PlayerName);

        var player = new Player()
        {
            ID = ObjectId.GenerateNewId(),
            ExternalID = Guid.NewGuid().ToString()[0..8].ToUpperInvariant(),
            Name = playerName,
            Balance = 1500,
        };

        game.Players.Add(player);
        game.UpdatedUTC = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        _eventService.Publish(game);

        Response = new(true, false, player.ExternalID);
    }

    private static string _HandlePlayerNameDuplicates(List<Player> players, string playerName)
    {
        var finalPlayerName = playerName.Trim();

        var foundDuplicate = false;
        var idx = 0;
        do
        {
            foundDuplicate = players.Any(x => x.Name == finalPlayerName);
            if (!foundDuplicate) { break; }
            finalPlayerName = $"{playerName} ({++idx})";

        } while (foundDuplicate);

        return finalPlayerName;
    }
}
