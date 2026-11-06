using Application.Common.Encrypt;
using Domain.Bitacora;
using Domain.Interfaces;
using MediatR;
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
            //  Buscar usuario
            var usuario = await _repository.GetById(request.UsuarioId);

            if (usuario == null)
            {
                throw new KeyNotFoundException(
                    $"No se encontró el usuario con ID {request.UsuarioId}");
            }

            // 2. Actualizar propiedades
            usuario.NombreCompleto = request.NombreCompleto;
            usuario.NombreUsuario = request.NombreUsuario;
            usuario.PasswordHash = _encrypt.encryptSHA256(request.PasswordHash);
            usuario.Activo = request.Activo;
            usuario.RolId = request.RolId;
            usuario.UsuarioAct = request.UsuarioLogeado;
            usuario.FechaAct = DateTime.Now;


            var bitacora = new BitacoraDomain(
                0,
                "Usuario",
                usuario.UsuarioId,    
                "Actualizar",
                $"Actualización del usuario {usuario.NombreCompleto}",
                DateTime.Now,
                request.UsuarioLogeado
            );
            await _repositoryBitacora.Create(bitacora);

            // Actualizar entidad
            await _repository.Update(usuario);

            //  Guardar cambios
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            //  Retornar resultado
            return new UsuarioResultDto(
                usuario.UsuarioId,
                usuario.NombreCompleto,
                usuario.NombreUsuario,
                usuario.UltimoAcceso,
                usuario.Activo,
                usuario.RolId,
                usuario.UsuarioIng,
                usuario.FechaIng,
                usuario.UsuarioAct,
                usuario.FechaAct
            );
        }
    }
}
