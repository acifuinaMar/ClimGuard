using Application.Comunidad;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.LecturaSensor.Service
{
    public record CreateLecturaSensorCommand(
        int lecturaId, 
        int sensorId, 
        decimal valor, 
        DateTime fechaHora,
        int UsuarioLogeado
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
