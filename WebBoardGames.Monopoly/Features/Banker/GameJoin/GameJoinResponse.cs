namespace WebBoardGames.Monopoly.Features.Banker.GameJoin;

public record GameJoinResponse(
    bool Exists,
    bool AlreadyInProgress,
    string? PlayerID
);
