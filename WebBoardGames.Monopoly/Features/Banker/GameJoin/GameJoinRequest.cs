using FluentValidation;

namespace WebBoardGames.Monopoly.Features.Banker.GameJoin;

public record GameJoinRequest(
    string GameID,
    string PlayerName
)
{
    public class Validator : FastEndpoints.Validator<GameJoinRequest>
    {
        public Validator()
        {
            RuleFor(x => x.GameID)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(x => x.PlayerName)
                .NotEmpty()
                .MaximumLength(100);
        }
    }
}
