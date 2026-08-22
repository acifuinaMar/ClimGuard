namespace Application.Login
{
    public record LoginResultDto(
        int UsuarioId,
        string Token,
        string Mensaje
    );
}