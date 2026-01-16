using FastEndpoints;
using System.Text.Json.Serialization;

[JsonSerializable(typeof(ErrorResponse))]
[JsonSerializable(typeof(WebBoardGames.Monopoly.Features.Banker.GameCreate.GameCreateRequest)), JsonSerializable(typeof(WebBoardGames.Monopoly.Features.Banker.GameCreate.GameCreateResponse))]
[JsonSerializable(typeof(WebBoardGames.Monopoly.Features.Banker.GameDataStream.GameDataStreamRequest)), JsonSerializable(typeof(WebBoardGames.Monopoly.Features.Banker.GameDataStream.GameDataStreamResponse))]
[JsonSerializable(typeof(WebBoardGames.Monopoly.Features.Banker.GameJoin.GameJoinRequest)), JsonSerializable(typeof(WebBoardGames.Monopoly.Features.Banker.GameJoin.GameJoinResponse))]
[JsonSerializable(typeof(WebBoardGames.Monopoly.Features.Banker.PaymentExecute.PaymentExecuteRequest))]
internal partial class AppJsonSerializerContext : JsonSerializerContext
{

}
