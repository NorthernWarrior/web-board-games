using Microsoft.Extensions.DependencyInjection;

namespace WebBoardGames.Monopoly.Services;

public static class ServiceCollectionExtensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection RegisterServicesFromMonopoly()
        {
            return services
                .AddSingleton<MonopolyBankerGameDataChangedEventService>();
        }
    }
}
