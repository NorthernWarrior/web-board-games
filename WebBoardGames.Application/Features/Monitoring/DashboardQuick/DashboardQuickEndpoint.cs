using Humanizer;
using Microsoft.EntityFrameworkCore;
using WebBoardGames.Persistence;
using WebBoardGames.Persistence.Entities.Monopoly.Banker;

namespace WebBoardGames.Application.Features.Monitoring.DashboardQuick;

public sealed class DashboardQuickEndpoint(BoardGamesDbContext _context, MongoDbDashboardService _mongoDb) : EndpointWithoutRequest<DashboardQuickResponse>
{
    // TODO: Replace AllowAnonymous with proper authorization
    public override void Configure()
    {
        Get("/dashboard/quick");
        Group<MonitoringGroup>();
        AllowAnonymous();
    }

    public async override Task HandleAsync(CancellationToken ct)
    {
        Response = new(
            FileSystem: await _FetchQuickFileSystemInfoAsync(ct),
            Monopoly: await _FetchQuickMonopolyInfo(ct)
        );
    }

    private async ValueTask<QuickFileSystemInfo> _FetchQuickFileSystemInfoAsync(CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();
        var stats = await _mongoDb.GetStatsAsync(ct);
        return new(stats.TotalSize.Bytes().Humanize(), stats.TotalSize);
    }

    private async ValueTask<QuickMonopolyInfo> _FetchQuickMonopolyInfo(CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();
        return new(await _FetchQuickMonopolyBankerInfo(ct));
    }
    private async ValueTask<QuickMonopolyBankerInfo> _FetchQuickMonopolyBankerInfo(CancellationToken ct)
    {
        var cntAllGames = await _context.MonopolyBankerGames.CountAsync(ct);

        var allGamesCappedAtThousand = await _context.MonopolyBankerGames.AsNoTracking()
            .ToListAsync(ct);

        var allGamesWasCappedAtThousand = cntAllGames > allGamesCappedAtThousand.Count;

        var cntWaiting = allGamesCappedAtThousand.Count(x => x.State == MonopolyBankerGameState.WaitingForPlayers);
        var cntInProgress = allGamesCappedAtThousand.Count(x => x.State == MonopolyBankerGameState.InProgress);
        var cntCompleted = allGamesCappedAtThousand.Count(x => x.State == MonopolyBankerGameState.Completed);

        var cutoffDateWaitingForPlayers = DateTime.UtcNow.AddDays(-1);
        var cutoffDateInProgress = DateTime.UtcNow.AddDays(-7);
        var cutoffDateCompleted = DateTime.UtcNow.AddDays(-1);

        var cntDueForCleanup = allGamesCappedAtThousand
            .Count(x =>
                (x.State == MonopolyBankerGameState.WaitingForPlayers && x.UpdatedUTC < cutoffDateWaitingForPlayers) ||
                (x.State == MonopolyBankerGameState.InProgress && x.UpdatedUTC < cutoffDateInProgress) ||
                (x.State == MonopolyBankerGameState.Completed && x.UpdatedUTC < cutoffDateCompleted)
            );

        var cntTotalPlayers = allGamesCappedAtThousand.Select(x => x.Players.Count).Sum();

        return new(
            CountGames: cntAllGames,
            AllGamesWasCappedAtThousand: allGamesWasCappedAtThousand,
            CountGamesWaitingForPlayers: cntWaiting,
            CountGamesInProgress: cntInProgress,
            CountGamesCompleted: cntCompleted,
            CountGamesDueForCleanup: cntDueForCleanup,
            CountTotalPlayers: cntTotalPlayers,
            CountAvgPlayersPerGame: (float)cntTotalPlayers / (cntAllGames == 0 ? 1 : cntAllGames)
        );
    }
}
