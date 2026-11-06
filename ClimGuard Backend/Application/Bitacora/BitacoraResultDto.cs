namespace Application.Bitacora
{
    public record BitacoraResultDto(
    long BitacoraId,
    string NombreEntidad,
    long EntidadId,
    string Accion,
    string Descripcion,
    DateTime FechaHora,
    int UsuarioId
);
}
