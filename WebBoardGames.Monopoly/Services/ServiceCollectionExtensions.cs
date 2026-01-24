using Microsoft.Extensions.DependencyInjection;
using WebBoardGames.Monopoly.Features.Banker.Services;

namespace WebBoardGames.Monopoly.Services;

public static class ServiceCollectionExtensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection RegisterServicesFromMonopoly()
        {
            return services
                .AddScoped<MonopolyBankerGameService>()
                .AddSingleton<MonopolyBankerGameDataChangedEventService>();
        }
    }
}
