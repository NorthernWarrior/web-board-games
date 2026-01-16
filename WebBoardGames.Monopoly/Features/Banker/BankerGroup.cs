using FastEndpoints;

namespace WebBoardGames.Monopoly.Features.Banker;

internal class BankerGroup : SubGroup<MonopolyGroup>
{
    public BankerGroup()
    {
        Configure("banker", ep =>
        {

        });
    }
}