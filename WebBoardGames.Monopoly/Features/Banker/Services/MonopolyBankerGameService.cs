using FastEndpoints;
using System.Linq.Expressions;
using WebBoardGames.Persistence.Entities.Monopoly.Banker;

namespace WebBoardGames.Monopoly.Features.Banker.Services;

[RegisterService<MonopolyBankerGameService>(LifeTime.Scoped)]
public sealed class MonopolyBankerGameService
{
    public void DummyFUnc() { }

    public static IEnumerable<Game> WhereDueForCleanup(IEnumerable<Game> games) => games.Where(IsDueForCleanupExpression().Compile());

    public static Expression<Func<Game, bool>> IsDueForCleanupExpression()
    {
        var cutoffDateWaitingForPlayers = DateTime.UtcNow.AddHours(-4);
        var cutoffDateInProgress = DateTime.UtcNow.AddDays(-7);
        var cutoffDateCompleted = DateTime.UtcNow.AddDays(-1);
        return x =>
                (x.State == MonopolyBankerGameState.WaitingForPlayers && x.UpdatedUTC < cutoffDateWaitingForPlayers) ||
                (x.State == MonopolyBankerGameState.InProgress && x.UpdatedUTC < cutoffDateInProgress) ||
                (x.State == MonopolyBankerGameState.Completed && x.UpdatedUTC < cutoffDateCompleted);
    }
}
