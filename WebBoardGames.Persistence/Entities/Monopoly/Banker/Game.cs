using MongoDB.Bson;

namespace WebBoardGames.Persistence.Entities.Monopoly.Banker;

public enum MonopolyBankerGameState
{
    WaitingForPlayers,
    InProgress,
    Completed
}

public class Game
{
    public required ObjectId ID { get; set; }
    public required string ExternalID { get; set; }
    public required string Label { get; set; }
    public required MonopolyBankerGameState State { get; set; }
    public required List<Player> Players { get; set; }
    public required Options Options { get; set; }


    public required DateTime CreatedUTC { get; set; }
    public required DateTime UpdatedUTC { get; set; }
    public required ObjectId? GameOwnerPlayerID { get; set; }
}
