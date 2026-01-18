using FastEndpoints;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Runtime.CompilerServices;
using WebBoardGames.Monopoly.Services;
using WebBoardGames.Persistence;
using WebBoardGames.Persistence.Entities.Monopoly.Banker;

namespace WebBoardGames.Monopoly.Features.Banker.GameDataStream;

public class GameDataStreamEndpoint(BoardGamesDbContext _context, MonopolyBankerGameDataChangedEventService _eventService) : Endpoint<GameDataStreamRequest>
{
    public override void Configure()
    {
        Get("{GameID}/stream");
        Group<BankerGroup>();
        AllowAnonymous();

        Description(b => b
            .Produces(200, contentType: "text/event-stream")
            .Produces<ErrorResponse>(400, "application/json")
            .Produces(404)
        );
    }

    public override async Task HandleAsync(GameDataStreamRequest request, CancellationToken ct)
    {
        var game = await _context.MonopolyBankerGames.FirstOrDefaultAsync(e => e.ExternalID == request.GameID, ct);
        if (game is null || !game.Players.Any(x => x.ExternalID == request.PlayerID))
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.EventStreamAsync("monopoly-banker-game-data", _StreamGameDataAsync(game, request.GameID, request.PlayerID, ct), ct);
    }

    private async IAsyncEnumerable<GameDataStreamResponse> _StreamGameDataAsync(Game currentGameState, string gameID, string playerID, [EnumeratorCancellation] CancellationToken ct)
    {
        yield return MapGameDataStreamResponseFrom(currentGameState, playerID);

        while (!ct.IsCancellationRequested)
        {
            var tcs = new TaskCompletionSource<GameDataStreamResponse>(TaskCreationOptions.RunContinuationsAsynchronously);

            void handler(object? s, MonopolyBankerGameDataChangedEventArgs e)
            {
                if (e.ChangedGame.ExternalID != gameID) return;
                tcs.TrySetResult(MapGameDataStreamResponseFrom(e.ChangedGame, playerID));
            }

            _eventService.GameDataChanged += handler;

            using (ct.Register(() => tcs.TrySetCanceled()))
            {
                try
                {
                    yield return await tcs.Task;
                }
                finally
                {
                    _eventService.GameDataChanged -= handler;
                }
            }
        }

    }

    private static GameDataStreamResponse MapGameDataStreamResponseFrom(Game game, string playerID)
    {
        var players = game.Players.Select(x => new GameDataStreamResponse.PlayerInfo(
            x.ExternalID,
            x.Name,
            x.Balance,
            x.ID == game.GameOwnerPlayerID,
            x.Balance <= 0,
            game.State == MonopolyBankerGameState.Completed && x.Balance == game.Players.Max(p => p.Balance)
        )).ToList();
        var player = players.First(x => x.ID == playerID);
        var freeParking = players.FirstOrDefault(x => x.ID == "free-parking");
        return new(
            ID: game.ExternalID,
            Label: game.Label,
            State: game.State,
            Players: players,
            Player: player,
            FreeParking: freeParking,
            new(game.Options.MoneyOnFreeParking, game.Options.DoubleMoneyOnGo)
        );
    }
}
