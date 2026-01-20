namespace WebBoardGames.Application.Helpers;

public static class PlayerNameHelper
{
    /// <summary>
    /// Ensures a player name is unique by adding a numeric suffix if the name already exists.
    /// </summary>
    /// <param name="existingNames">The list of existing player names</param>
    /// <param name="proposedName">The proposed player name</param>
    /// <returns>A unique name, with (1), (2), (3) etc. appended if necessary</returns>
    public static string EnsureUniqueName(IEnumerable<string> existingNames, string proposedName)
    {
        var trimmedName = proposedName.Trim();
        var finalName = trimmedName;
        
        var idx = 0;
        while (existingNames.Any(x => x == finalName))
        {
            finalName = $"{trimmedName} ({++idx})";
        }
        
        return finalName;
    }
}
