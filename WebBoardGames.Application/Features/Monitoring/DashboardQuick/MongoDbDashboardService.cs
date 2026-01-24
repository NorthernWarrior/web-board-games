
using MongoDB.Bson;
using MongoDB.Driver;

namespace WebBoardGames.Application.Features.Monitoring.DashboardQuick;

[RegisterService<MongoDbDashboardService>(LifeTime.Scoped)]
public class MongoDbDashboardService(IMongoClient _mongoClient)
{
    internal async ValueTask<MongoDbStats> GetStatsAsync(CancellationToken ct)
    {
        var database = _mongoClient.GetDatabase("web-board-games");
        var stats = await database.RunCommandAsync<BsonDocument>(new BsonDocument("dbStats", 1), cancellationToken: ct);
        var totalSize = stats.GetValue("totalSize", defaultValue: 0).ToInt64();
        var objectCnt = stats.GetValue("objects", defaultValue: 0).ToInt64();
        return new(totalSize, objectCnt);
    }
}

/// <param name="TotalSize">Sum of the disk space allocated for both documents and indexes in all collections in the database.<br/>Includes used and free storage space<br/>Unit: bytes</param>
/// <param name="ObjectCnt">Total number of documents (records) in the database</param>
internal record MongoDbStats(
    long TotalSize,
    long ObjectCnt
);

// other possible values for the dbStats https://www.mongodb.com/docs/manual/reference/command/dbStats/#output 
