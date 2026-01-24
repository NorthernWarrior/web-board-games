namespace WebBoardGames.Application.Features.Monitoring;

internal class MonitoringGroup : Group
{
    public MonitoringGroup()
    {
        Configure("monitoring", ep =>
        {
            ep.AuthSchemes("ApiKey");
            ep.Claims("monitoring:ro");
        });
    }
}