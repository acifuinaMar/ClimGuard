using Application.Common.Encrypt;
using Domain.Bitacora;
using Domain.Interfaces;
using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Usuario.Service.Commands
{
    public sealed class UpdateUsuarioCommandHandler : IRequestHandler<UpdateUsuarioCommand, UsuarioResultDto>
    {
        private readonly IUsuario _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly EncryptPassword _encrypt;
        private readonly IBitacora _repositoryBitacora;

        public UpdateUsuarioCommandHandler(IUsuario repository, IUnitOfWork unitOfWork, EncryptPassword encrypt, IBitacora repositoryBitacora)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _encrypt = encrypt;
            _repositoryBitacora = repositoryBitacora;
        }
        public async Task<UsuarioResultDto> Handle(UpdateUsuarioCommand request, CancellationToken cancellationToken)
        {

            var nombreUsuario = !string.IsNullOrWhiteSpace(request.Nombre1) && !string.IsNullOrWhiteSpace(request.Apellido1)
                ? $"{char.ToUpper(request.Nombre1.Trim()[0])}{request.Apellido1.Trim()}"
                : "" ?? string.Empty;

            //  Buscar usuario
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
            usuario.NombreUsuario = nombreUsuario.ToLower();
            usuario.PasswordHash = _encrypt.encryptSHA256(request.PasswordHash);
            usuario.Rol = request.Rol;
            usuario.Activo = request.Activo;


            var bitacora = new BitacoraDomain(
                0,
                request.UsuarioLogeado,
                $"Actualiza de usuario {request.UsuarioId}",
                DateTime.Now
                );
            await _repositoryBitacora.Create(bitacora);

            // Actualizar entidad
            await _repository.Update(usuario);

            //  Guardar cambios
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            //  Retornar resultado
            return new UsuarioResultDto(
                usuario.UsuarioId,
                usuario.Apellido2,
                usuario.Apellido1,
                usuario.Nombre2,
                usuario.Nombre1,
                usuario.NombreUsuario,
                usuario.Rol,
                usuario.Activo,
                usuario.FechaRegistro
                );
        }
    }
}
