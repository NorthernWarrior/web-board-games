using MongoDB.Bson;

namespace WebBoardGames.Persistence.Entities.Monopoly.Banker;

public class Player
{
    public required ObjectId ID { get; set; }
    public required string ExternalID { get; set; }
    public required string Name { get; set; }
    public required int Balance { get; set; }
}
