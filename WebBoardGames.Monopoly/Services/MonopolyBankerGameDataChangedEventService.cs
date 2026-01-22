using FastEndpoints;
using WebBoardGames.Persistence.Entities.Monopoly.Banker;

namespace WebBoardGames.Monopoly.Services;

[RegisterService<MonopolyBankerGameDataChangedEventService>(LifeTime.Singleton)]
public record MonopolyBankerGameDataChangedEventArgs(Game ChangedGame);

public class MonopolyBankerGameDataChangedEventService
{
    public event EventHandler<MonopolyBankerGameDataChangedEventArgs>? GameDataChanged;

    public void Publish(Game changedGame)
    {
        GameDataChanged?.Invoke(this, new MonopolyBankerGameDataChangedEventArgs(changedGame));
    }
}
