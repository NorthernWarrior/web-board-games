using FastEndpoints;

namespace WebBoardGames.Monopoly.Features;

internal class MonopolyGroup : Group
{
    public MonopolyGroup()
    {
        Configure("monopoly", ep =>
        {

        });
    }
}