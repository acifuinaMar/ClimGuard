using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Usuario.Service.Commands
{
    public sealed class UpdateUsuarioCommandHandler : IRequestHandler<UpdateUsuarioCommand, UsuarioResultDto>
    {
        private readonly IUsuario _repository;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateUsuarioCommandHandler(IUsuario repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        public async Task<UsuarioResultDto> Handle(UpdateUsuarioCommand request, CancellationToken cancellationToken)
        {
            // 1. Buscar la comunidad
            var usuario = await _repository.GetById(request.UsuarioId);

            if (usuario == null)
            {
                throw new KeyNotFoundException(
                    $"No se encontró el usuario con ID {request.UsuarioId}");
            }

            // 2. Actualizar propiedades
            usuario.UsuarioId = request.UsuarioId;
            usuario.Apellido2 = request.Apellido2;
            usuario.Apellido1 = request.Apellido1;
            usuario.Nombre2 = request.Nombre2;
            usuario.Nombre1 = request.Nombre1;
            usuario.NombreUsuario = request.NombreUsuario;
            usuario.PasswordHash = request.PasswordHash;
            usuario.Rol = request.Rol;
            usuario.Activo = request.Activo;

            // 3. Actualizar entidad
            await _repository.Update(usuario);

            // 4. Guardar cambios
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            // 5. Retornar resultado
            return new UsuarioResultDto(
                usuario.UsuarioId,
                usuario.Apellido2,
                usuario.Apellido1,
                usuario.Nombre2,
                usuario.Nombre1,
                usuario.NombreUsuario,
                usuario.PasswordHash,
                usuario.Rol,
                usuario.Activo,
                usuario.FechaRegistro
                );
        }
    }
}
