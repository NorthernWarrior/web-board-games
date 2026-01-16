using FluentValidation;

namespace WebBoardGames.Monopoly.Features.Banker.GameCreate;

public record GameCreateRequest(
    string Label,
    string PlayerName,
    bool MoneyOnFreeParking,
    bool DoubleMoneyOnGo
)
{
    public class Validator : FastEndpoints.Validator<GameCreateRequest>
    {
        public Validator()
        {
            RuleFor(x => x.Label)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(x => x.PlayerName)
                .NotEmpty()
                .MaximumLength(100);
        }
    }
}
