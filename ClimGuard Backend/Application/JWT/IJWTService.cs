namespace Application.JWT
{
    public interface IJWTService
    {
        string GenerateToken(
        int userId,
        string username,
        IEnumerable<string> roles);
    }
}
