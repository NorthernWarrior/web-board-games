using FastEndpoints;
using System.Text.Json.Serialization;

namespace WebBoardGames.API;

[JsonSerializable(typeof(ErrorResponse))]
[JsonSerializable(typeof(Monopoly.Features.Banker.GameCreate.GameCreateRequest)), JsonSerializable(typeof(Monopoly.Features.Banker.GameCreate.GameCreateResponse))]
[JsonSerializable(typeof(Monopoly.Features.Banker.GameDataStream.GameDataStreamRequest)), JsonSerializable(typeof(Monopoly.Features.Banker.GameDataStream.GameDataStreamResponse))]
[JsonSerializable(typeof(Monopoly.Features.Banker.GameJoin.GameJoinRequest)), JsonSerializable(typeof(Monopoly.Features.Banker.GameJoin.GameJoinResponse))]
[JsonSerializable(typeof(Monopoly.Features.Banker.GamesStillActive.GamesStillActiveRequest)), JsonSerializable(typeof(Monopoly.Features.Banker.GamesStillActive.GamesStillActiveResponse))]
[JsonSerializable(typeof(Monopoly.Features.Banker.PaymentExecute.PaymentExecuteRequest))]
internal partial class AppJsonSerializerContext : JsonSerializerContext
{

}
