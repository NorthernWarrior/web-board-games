using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace WebBoardGames.Domain.Options;

public static class ServiceCollectionOptionsExtensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddMonopolyDomainOptionServices(IConfiguration config)
        {
            return services
                ._AddSettings<ApiKeysOptions>(config.GetSection(ApiKeysOptions.SectionName), addServiceShortcut: true)
                .AddValidatorsFromAssemblyContaining<ApiKeysOptions>(ServiceLifetime.Singleton);
        }

        private IServiceCollection _AddSettings<TSettings>(IConfigurationSection configSection, bool addServiceShortcut = true) where TSettings : class
        {
            services.AddOptions<TSettings>()
                .Bind(configSection)
                .ValidateFluently()
                .ValidateOnStart();
            if (addServiceShortcut)
            {
                services.AddTransient(sp => sp.GetRequiredService<Microsoft.Extensions.Options.IOptionsMonitor<TSettings>>().CurrentValue);
            }
            return services;
        }
    }
}
