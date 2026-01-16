using WebBoardGames.Persistence.Entities.Monopoly.Banker;

namespace WebBoardGames.Monopoly.Features.Banker.GameDataStream;

public record GameDataStreamResponse(
    string ID,
    string Label,
    MonopolyBankerGameState State,
    List<GameDataStreamResponse.PlayerInfo> Players,
    GameDataStreamResponse.PlayerInfo Player,
    GameDataStreamResponse.PlayerInfo? FreeParking,
    GameDataStreamResponse.GameOptions Options
)
{
    public record PlayerInfo(
        string ID,
        string Name,
        int Balance
    );
    public record GameOptions(
        bool MoneyOnFreeParking,
        bool DoubleMoneyOnGo
    );
}