using MediatR;

namespace Application.Bitacora.Sevice
{
    public record BitacoraCommand(
    string NombreEntidad,
    long EntidadId,
    string Accion,
    string Descripcion,
    DateTime FechaHora,
    int UsuarioId
) : IRequest<bool>;
}
