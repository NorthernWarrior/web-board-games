using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using WebBoardGames.Monopoly.Services;
using WebBoardGames.Persistence;
using WebBoardGames.Persistence.Entities.Monopoly.Banker;

namespace WebBoardGames.Monopoly.Features.Banker.PaymentExecute;

public partial class PaymentExecuteEndpoint(BoardGamesDbContext _context, MonopolyBankerGameDataChangedEventService _eventService) : Endpoint<PaymentExecuteRequest>
{

    public override void Configure()
    {
        Post("/payment");
        Group<BankerGroup>();
        AllowAnonymous();
    }

    public override async Task HandleAsync(PaymentExecuteRequest req, CancellationToken ct)
    {
        var game = await _context.MonopolyBankerGames
            .Where(g => g.ExternalID == req.GameID)
            .FirstOrDefaultAsync(ct);

        if (game is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }
        else if (game.State == MonopolyBankerGameState.Completed)
        {
            return;
        }

        var source = req.SourcePlayerID is not null
            ? game.Players.FirstOrDefault((p) => p.ExternalID == req.SourcePlayerID)
            : null;
        var target = req.TargetPlayerID is not null
          ? game.Players.FirstOrDefault((p) => p.ExternalID == req.TargetPlayerID)
          : null;

        if (source is not null)
        {
            source.Balance -= req.Amount;
        }
        if (target is not null)
        {
            target.Balance += req.Amount;
        }

        var onlyOnePlayerNotBancrupt = game.Players
            .Count(p => p.ExternalID != "free-parking" && p.Balance > 0) == 1;

        game.State = onlyOnePlayerNotBancrupt ? MonopolyBankerGameState.Completed : MonopolyBankerGameState.InProgress;
        game.UpdatedUTC = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        _eventService.Publish(game);
    }
}
