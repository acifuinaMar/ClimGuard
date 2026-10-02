namespace Application.Bitacora
{
    public record BitacoraResultDto(
        int bitacoraId, 
        int usuarioId, 
        string accion, 
        DateTime fechaRegistro
        );
}
