using FluentValidation;

namespace WebBoardGames.Monopoly.Features.Banker.PaymentExecute;

public record PaymentExecuteRequest(
    string GameID,
    string? SourcePlayerID,
    string? TargetPlayerID,
    int Amount
)
{
    public class Validator : FastEndpoints.Validator<PaymentExecuteRequest>
    {
        public Validator()
        {
            RuleFor(x => x.GameID)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(x => x.SourcePlayerID)
                .MaximumLength(100);

            RuleFor(x => x.TargetPlayerID)
                .MaximumLength(100);

            RuleFor(x => x.Amount)
                .GreaterThan(0);
        }
    }
}
