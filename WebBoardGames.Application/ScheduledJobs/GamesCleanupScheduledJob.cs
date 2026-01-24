using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using WebBoardGames.Monopoly.Features.Banker.Services;
using WebBoardGames.Persistence;

namespace WebBoardGames.Application.ScheduledJobs;

public class GamesCleanupScheduledJob(IServiceScopeFactory _scopeFactory) : IJob
{
    public async Task Execute(IJobExecutionContext context)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var services = scope.ServiceProvider;
        var db = services.GetRequiredService<BoardGamesDbContext>();
        db.Database.AutoTransactionBehavior = AutoTransactionBehavior.Never;

        db.RemoveRange(db.MonopolyBankerGames.Where(MonopolyBankerGameService.IsDueForCleanupExpression()));
        await db.SaveChangesAsync();
    }
}
