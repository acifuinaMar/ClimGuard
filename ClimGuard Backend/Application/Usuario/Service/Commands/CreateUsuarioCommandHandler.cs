using Application.Common.Encrypt;
using Domain.Entities.User;
using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Usuario.Service.Commands
{
    public sealed class CreateUsuarioCommandHandler : IRequestHandler<CreateUsuarioCommand, UsuarioResultDto>
    {
        private readonly IUsuario _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly EncryptPassword _encrypt;

        public CreateUsuarioCommandHandler(IUsuario repository, IUnitOfWork unitOfWork, EncryptPassword encrypt)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _encrypt = encrypt;
        }
        public async Task<UsuarioResultDto> Handle(CreateUsuarioCommand request, CancellationToken cancellationToken)
        {
            var usuario = new UsuarioDomain(
                0,
                request.Apellido2,
                request.Apellido1,
                request.Nombre2,
                request.Nombre1,
                request.NombreUsuario,
                _encrypt.encryptSHA256(request.PasswordHash),
                //request.PasswordHash,
                request.Rol,
                request.Activo,
                request.FechaRegistro.ToDateTime(TimeOnly.MinValue)
            );
            await _repository.Create(usuario);
            await _unitOfWork.SaveChangeAsync(cancellationToken);

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
