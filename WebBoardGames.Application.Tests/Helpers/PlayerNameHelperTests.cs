using Bogus;
using Shouldly;
using WebBoardGames.Application.Helpers;

namespace WebBoardGames.Application.Tests.Helpers;

public class PlayerNameHelperTests
{
    [Theory]
    [InlineData(new[] { "Alice", "Bob" }, "Charlie", "Charlie")]
    [InlineData(new[] { "Alice", "Bob" }, "Alice", "Alice (1)")]
    [InlineData(new[] { "Alice", "Alice (1)" }, "Alice", "Alice (2)")]
    [InlineData(new[] { "Alice", "Alice (1)", "Alice (2)" }, "Alice", "Alice (3)")]
    [InlineData(new[] { "Player", "Player (1)", "Player (2)", "Player (3)" }, "Player", "Player (4)")]
    [InlineData(new string[] { }, "NewPlayer", "NewPlayer")]
    [InlineData(new[] { "Test" }, "Test ", "Test (1)")]
    [InlineData(new[] { "Test" }, " Test", "Test (1)")]
    [InlineData(new[] { "Game", "Game (1)", "Game (2)", "Game (3)", "Game (4)", "Game (5)" }, "Game", "Game (6)")]
    [InlineData(new[] { "Alpha", "Beta", "Gamma" }, "Delta", "Delta")]
    [InlineData(new[] { "Player1", "Player2", "Player3", "Player4", "Player5", "Player6", "Player7", "Player8", "Player9" }, "Player10", "Player10")]
    [InlineData(new[] { "User", "User (1)", "User (2)", "User (3)", "User (4)", "User (5)", "User (6)", "User (7)", "User (8)", "User (9)" }, "User", "User (10)")]
    public void EnsureUniqueName_WithVariousInputs_ReturnsUniqueNames(string[] existingNames, string proposedName, string expectedName)
    {
        var result = PlayerNameHelper.EnsureUniqueName(existingNames, proposedName);
        result.ShouldBe(expectedName);
    }

    [Fact]
    public void EnsureUniqueName_WithEmptyList_ReturnsOriginalNameTrimmed()
    {
        var existingNames = new List<string>();
        var proposedName = "  NewPlayer  ";
        var result = PlayerNameHelper.EnsureUniqueName(existingNames, proposedName);
        result.ShouldBe("NewPlayer");
    }

    [Fact]
    public void EnsureUniqueName_WithMultipleDuplicates_ReturnsCorrectSuffixedName()
    {
        var existingNames = new List<string> { "John", "John (1)", "John (2)", "John (3)", "John (4)" };
        var proposedName = "John";
        var result = PlayerNameHelper.EnsureUniqueName(existingNames, proposedName);
        result.ShouldBe("John (5)");
    }

    [Fact]
    public void EnsureUniqueName_GeneratedNames_AreAlwaysUnique()
    {
        var faker = new Faker();
        var existingNames = new List<string>();
        var baseName = faker.Name.FirstName();

        for (int i = 0; i < 20; i++)
        {
            var uniqueName = PlayerNameHelper.EnsureUniqueName(existingNames, baseName);
            existingNames.Add(uniqueName);
        }

        existingNames.Count.ShouldBe(20);
        existingNames.Distinct().Count().ShouldBe(20);
        existingNames[0].ShouldBe(baseName);
        existingNames[1].ShouldBe($"{baseName} (1)");
        existingNames[19].ShouldBe($"{baseName} (19)");
    }

    [Theory]
    [InlineData("TestPlayer")]
    [InlineData("A")]
    [InlineData("Very Long Player Name With Spaces")]
    [InlineData("Player-123")]
    public void EnsureUniqueName_WithDifferentNameFormats_WorksCorrectly(string baseName)
    {
        var existingNames = new List<string> { baseName };
        var result = PlayerNameHelper.EnsureUniqueName(existingNames, baseName);
        result.ShouldBe($"{baseName} (1)");
    }

    [Fact]
    public void EnsureUniqueName_WithRandomBogusData_EnsuresUniqueness()
    {
        var faker = new Faker();
        var names = new List<string>();
        
        for (int i = 0; i < 15; i++)
        {
            var baseName = faker.Name.FirstName();
            
            for (int j = 0; j < 3; j++)
            {
                var uniqueName = PlayerNameHelper.EnsureUniqueName(names, baseName);
                names.Add(uniqueName);
            }
        }

        names.Count.ShouldBe(45);
        names.Distinct().Count().ShouldBe(45);
    }
}
