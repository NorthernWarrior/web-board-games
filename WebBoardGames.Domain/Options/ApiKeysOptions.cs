using FluentValidation;
using System.Diagnostics.CodeAnalysis;
using System.Security.Cryptography;

namespace WebBoardGames.Domain.Options;

public class ApiKeysOptions : List<ApiKey>
{
    public const string SectionName = "ApiKeys";

    public bool TryGetValue(string apiKey, [NotNullWhen(true)] out ApiKey? key)
    {
        var apiKeyHash = Convert.ToHexStringLower(SHA512.HashData(System.Text.Encoding.UTF8.GetBytes(apiKey)));

        foreach (var declaration in this)
        {
            if (declaration.KeyHash == apiKeyHash)
            {
                key = declaration;
                return true;
            }
        }
        key = null;
        return false;
    }

    public class Validator : AbstractValidator<ApiKeysOptions>
    {
        public Validator()
        {
            RuleForEach(x => x)
                .ChildRules(apiKey =>
                {
                    apiKey.RuleFor(x => x.Label)
                        .NotEmpty().WithMessage("When defining an api key, the \"Label\" must be provided");

                    apiKey.RuleFor(x => x.KeyHash)
                        .NotEmpty().WithMessage("When defining an api key, the \"KeyHash\" must be provided - a SHA-512 of the original key");

                    apiKey.RuleFor(x => x.Claims)
                        .NotEmpty().WithMessage("When defining an api key, at least one claim must be provided - comma separated");
                });
        }
    }
}

public class ApiKey
{
    public string Label { get; set; } = string.Empty;
    public string KeyHash { get; set; } = string.Empty;
    public string Claims { get; set; } = string.Empty;
    public DateTimeOffset? ExpiresAt { get; set; } = null;
}
