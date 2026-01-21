using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using WebBoardGames.Persistence;
using WebBoardGames.Persistence.Entities.Monopoly.Banker;

namespace WebBoardGames.Monopoly.Features.Banker.GamesStillActive;

public class GamesStillActiveEndpoint(BoardGamesDbContext _context) : Endpoint<GamesStillActiveRequest, GamesStillActiveResponse>
{
    public override void Configure()
    {
        Post("/still-active");
        Group<BankerGroup>();
        AllowAnonymous();
    }

    public override async Task HandleAsync(GamesStillActiveRequest req, CancellationToken ct)
    {
        if (req.GameIDs.Count == 0)
        {
            Response = new([]);
            return;
        }

        var activeGameIDs = await _context.MonopolyBankerGames
            .Where(g => req.GameIDs.Contains(g.ExternalID))
            .Where(g => g.State != MonopolyBankerGameState.Completed)
            .Select(g => g.ExternalID)
            .ToHashSetAsync(ct);
        await _context.SaveChangesAsync(ct);

        var gameIdStates = new Dictionary<string, bool>(req.GameIDs.Count);
        foreach (var gameId in req.GameIDs)
        {
            gameIdStates[gameId] = activeGameIDs.Contains(gameId);
        }

        Response = new(gameIdStates);
    }
}
