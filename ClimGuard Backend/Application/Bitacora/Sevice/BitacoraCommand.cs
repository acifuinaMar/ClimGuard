using MediatR;

namespace Application.Bitacora.Sevice
{
    public record BitacoraCommand(
        int bitacoraId, 
        int usuarioId, 
        string accion, 
        DateTime fechaRegistro
        ) : IRequest<bool>;
}
