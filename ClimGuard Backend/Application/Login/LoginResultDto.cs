namespace Application.Login
{
    public record LoginResultDto(
        string Usuario,
        string Token,
        string Mensaje
        );
}
