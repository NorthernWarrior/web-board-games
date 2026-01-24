using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace WebBoardGames.Domain.Options;

public class FluentValidationsValidateOptions<TOptions>(string? name, IValidator<TOptions> fluentValidator) : IValidateOptions<TOptions> where TOptions : class
{
    private readonly IValidator<TOptions> _fluentValidator = fluentValidator;

    /// <summary>
    /// Gets the options name.
    /// </summary>
    public string? Name { get; } = name;

    public ValidateOptionsResult Validate(string? name, TOptions options)
    {
        // Null name is used to configure all named options.
        if (Name != null && Name != name)
        {
            // Ignored if not validating this instance.
            return ValidateOptionsResult.Skip;
        }

        // Ensure options are provided to validate against
        ArgumentNullException.ThrowIfNull(options);

        var validationResult = _fluentValidator.Validate(options);
        if (validationResult.IsValid)
        {
            return ValidateOptionsResult.Success;
        }

        var errors = validationResult.Errors.Select(x =>
            $"Options validation failed for '{x.PropertyName}' with error: {x.ErrorMessage}"
        );
        return ValidateOptionsResult.Fail(errors);
    }
}

public static class OptionsBuilderExtensions
{
    extension<TOptions>(OptionsBuilder<TOptions> builder) where TOptions : class
    {
        public OptionsBuilder<TOptions> ValidateFluently()
        {
            builder.Services.AddSingleton<IValidateOptions<TOptions>>(s =>
                {
                    var validator = s.GetService<IValidator<TOptions>>();
                    if (validator is null) { return new AlwaysSuccessValidator<TOptions>(); }
                    return new FluentValidationsValidateOptions<TOptions>(builder.Name, s.GetRequiredService<IValidator<TOptions>>());
                }
            );
            return builder;
        }
    }

    private sealed class AlwaysSuccessValidator<TOptions> : IValidateOptions<TOptions>
        where TOptions : class
    {
        public ValidateOptionsResult Validate(string? name, TOptions options) => ValidateOptionsResult.Success;
    }
}