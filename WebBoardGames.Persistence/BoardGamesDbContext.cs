using Microsoft.EntityFrameworkCore;
using MongoDB.EntityFrameworkCore.Extensions;

namespace WebBoardGames.Persistence;

public sealed class BoardGamesDbContext(DbContextOptions<BoardGamesDbContext> options) : DbContext(options)
{
    public DbSet<Entities.Monopoly.Banker.Game> MonopolyBankerGames { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Entities.Monopoly.Banker.Game>(e =>
        {
            e.ToCollection("monopoly-banker-games");

            e.HasIndex(e => e.ExternalID).IsUnique(true);
            e.HasIndex(e => e.UpdatedUTC);
        });
    }
}
