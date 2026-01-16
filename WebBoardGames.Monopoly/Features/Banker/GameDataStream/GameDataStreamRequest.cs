using FluentValidation;

namespace WebBoardGames.Monopoly.Features.Banker.GameDataStream;

public record GameDataStreamRequest(string GameID, string PlayerID)
{
    public class Validator : FastEndpoints.Validator<GameDataStreamRequest>
    {
        public Validator()
        {
            RuleFor(x => x.GameID)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(x => x.PlayerID)
                .NotEmpty()
                .NotEqual("free-parking")
                .MaximumLength(100);
        }
    }
}
