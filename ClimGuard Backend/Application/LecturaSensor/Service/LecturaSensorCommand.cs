using MediatR;

namespace Application.LecturaSensor.Service
{
    public record CreateLecturaSensorCommand(
        int lecturaId, 
        int sensorId, 
        decimal valor, 
        DateTime fechaHora,
        int usuarioIng
    ) : IRequest<LecturaSensorResultDto>;


    public record UpdateLecturaSensorCommand(
        int lecturaId,
        int sensorId,
        decimal valor,
        DateTime fechaHora,
        int UsuarioLogeado
    ) : IRequest<LecturaSensorResultDto>;


    public record DeleteLecturaSensorCommand(
        int lecturaId,
        int UsuarioLogeado
    ) : IRequest<bool>;
}
