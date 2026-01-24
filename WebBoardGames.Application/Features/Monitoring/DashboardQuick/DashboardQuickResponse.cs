using System.Collections.ObjectModel;

namespace WebBoardGames.Application.Features.Monitoring.DashboardQuick;

public record DashboardQuickResponse(
    QuickFileSystemInfo FileSystem,
    QuickScheduledJobsInfo ScheduledJobs,
    QuickMonopolyInfo Monopoly
);

public record QuickFileSystemInfo(string MongoDbSize, long MongoDbSizeBytes);

public record QuickScheduledJobsInfo(
    ReadOnlyCollection<QuickScheduledJobInfo> Jobs,
    ReadOnlyCollection<string> Running
);
public record QuickScheduledJobInfo(
    string Group,
    string Key,
    ReadOnlyCollection<QuickScheduledJobTriggerInfo> Triggers
);
public record QuickScheduledJobTriggerInfo(
    string Group,
    string Name,
    DateTimeOffset? NextFireTime,
    DateTimeOffset? PrevFireTime,
    string Info
);

public record QuickMonopolyInfo(
    QuickMonopolyBankerInfo Banker
);

/// <param name="AllGamesWasCappedAtThousand">
/// If this is true, that means there are more than a thousand game entities.<br/>
/// Because the games need to be allocated in memory for the statisitc to work, we don't load all existing games (see <see cref="CountGames"/>).
/// That means if this Flag is true, then all other Properties (except for <see cref="CountGames"/>) are actually meaningless.
/// </param>
public record QuickMonopolyBankerInfo(
    long CountGames,
    bool AllGamesWasCappedAtThousand,
    long CountGamesWaitingForPlayers,
    long CountGamesInProgress,
    long CountGamesCompleted,
    long CountGamesDueForCleanup,
    long CountTotalPlayers,
    float CountAvgPlayersPerGame
);
