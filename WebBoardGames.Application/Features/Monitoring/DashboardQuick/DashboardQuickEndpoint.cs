using Humanizer;
using Microsoft.EntityFrameworkCore;
using WebBoardGames.Domain.Options;
using WebBoardGames.Domain.Services;
using WebBoardGames.Monopoly.Features.Banker.Services;
using WebBoardGames.Persistence;
using WebBoardGames.Persistence.Entities.Monopoly.Banker;

namespace WebBoardGames.Application.Features.Monitoring.DashboardQuick;

public sealed class DashboardQuickEndpoint(
    BoardGamesDbContext _context,
    MongoDbDashboardService _mongoDb,
    IJobSchedulerService _scheduler
) : EndpointWithoutRequest<DashboardQuickResponse>
{
    public override void Configure()
    {
        Get("/dashboard/quick");
        Group<MonitoringGroup>();
    }

    public async override Task HandleAsync(CancellationToken ct)
    {
        Response = new(
            FileSystem: await _FetchQuickFileSystemInfoAsync(ct),
            ScheduledJobs: await _FetchQuickScheduleJobsInfo(ct),
            Monopoly: await _FetchQuickMonopolyInfo(ct)
        );
    }

    private async ValueTask<QuickFileSystemInfo> _FetchQuickFileSystemInfoAsync(CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();
        var stats = await _mongoDb.GetStatsAsync(ct);
        return new(stats.TotalSize.Bytes().Humanize(), stats.TotalSize);
    }

    private async ValueTask<QuickScheduledJobsInfo> _FetchQuickScheduleJobsInfo(CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();
        var jobs = await _scheduler.GetScheduledJobsAsync(ct);
        var running = await _scheduler.GetRunningJobsAsync(ct);
        return new(
            Jobs: [.. jobs.Select(x => new QuickScheduledJobInfo(
                x.Group,
                x.Key,
                x.Triggers.Select(t => new QuickScheduledJobTriggerInfo(
                    t.Group,
                    t.Key,
                    t.NextFireTime,
                    t.PreviousFireTime,
                    t.Info
                )).ToList().AsReadOnly()
            ))],
            Running: running
        );
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

        var cntDueForCleanup = MonopolyBankerGameService
            .WhereDueForCleanup(allGamesCappedAtThousand)
            .Count();

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
