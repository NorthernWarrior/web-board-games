using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;
using WebBoardGames.Domain.Constants;
using WebBoardGames.Domain.Options;

namespace WebBoardGames.API.Authentication;

public class ApiKeyAuthenticationHandler(
    ILogger<ApiKeyAuthenticationHandler> _logger,
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    ApiKeysOptions _apiKeys
) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (_logger.IsEnabled(LogLevel.Information)) { _logger.LogInformation("Handling ApiKey authentication"); }

        if (_logger.IsEnabled(LogLevel.Information)) { _logger.LogInformation("Checking for presence of API key header"); }

        const string apiKeyAuthError = "ApiKey Authentication Failed\n{Reason}";

        if (!Request.Headers.TryGetValue(AuthConstants.ApiKeyHeader, out var apiKeyInHeader) || string.IsNullOrWhiteSpace(apiKeyInHeader))
        {
            var reason = $"Missing \"{AuthConstants.ApiKeyHeader}\" Header";
            if (_logger.IsEnabled(LogLevel.Information)) { _logger.LogInformation(apiKeyAuthError, reason); }
            return Task.FromResult(AuthenticateResult.Fail("Unauthorized"));
        }

        if (!_apiKeys.TryGetValue(apiKeyInHeader.ToString(), out var foundApiKey) || foundApiKey.ExpiresAt < DateTimeOffset.UtcNow)
        {
            var reason = "Invalid or Expired API Key";
            if (_logger.IsEnabled(LogLevel.Information)) { _logger.LogInformation(apiKeyAuthError, reason); }
            return Task.FromResult(AuthenticateResult.Fail("Unauthorized"));
        }

        var identity = new ClaimsIdentity(
            claims: foundApiKey.Claims.Split(",").Select(x => new Claim(x, string.Empty)),
            authenticationType: Scheme.Name
        );
        var ticket = new AuthenticationTicket(
            new(identity),
            authenticationScheme: Scheme.Name
        );

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
