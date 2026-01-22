namespace WebBoardGames.Application.Features.Monitoring.DashboardQuick;

public record DashboardQuickResponse(
    QuickFileSystemInfo FileSystem,
    QuickMonopolyInfo Monopoly
);

public record QuickFileSystemInfo(string MongoDbSize, long MongoDbSizeBytes);

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
