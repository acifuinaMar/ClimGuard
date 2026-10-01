using Application.Common.Encrypt;
using Domain.Bitacora;
using Domain.Entities.User;
using Domain.Interfaces;
using MediatR;
using Domain.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Usuario.Service.Commands
{
    public sealed class CreateUsuarioCommandHandler : IRequestHandler<CreateUsuarioCommand, UsuarioResultDto>
    {
        private readonly IUsuario _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly EncryptPassword _encrypt;
        private readonly IBitacora _repositoryBitacora;

        public CreateUsuarioCommandHandler(IUsuario repository, IUnitOfWork unitOfWork, EncryptPassword encrypt, IBitacora repositoryBitacora)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _encrypt = encrypt;
            _repositoryBitacora = repositoryBitacora;
        }
        public async Task<UsuarioResultDto> Handle(CreateUsuarioCommand request, CancellationToken cancellationToken)
        {
            var usuario = new UsuarioDomain(
                0,
                request.NombreCompleto,
                request.NombreUsuario,
                _encrypt.encryptSHA256(request.PasswordHash),
                null,                    // UltimoAcceso
                request.Activo,
                request.RolId,
                request.UsuarioLogeado,  // UsuarioIng
                DateTime.Now,            // FechaIng
                null,                    // UsuarioAct
                null                     // FechaAct
            );


            var bitacora = new BitacoraDomain(
                0,
                request.UsuarioLogeado,
                $"Registro de usuario {request.NombreCompleto}",
                DateTime.Now
                );
            await _repositoryBitacora.Create(bitacora);

            await _repository.Create(usuario);
            await _unitOfWork.SaveChangeAsync(cancellationToken);

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
