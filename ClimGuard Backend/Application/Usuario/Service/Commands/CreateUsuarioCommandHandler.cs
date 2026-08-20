using Application.Common.Encrypt;
using Domain.Bitacora;
using Domain.Entities.User;
using Domain.Interfaces;
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
            var nombreUsuario = !string.IsNullOrWhiteSpace(request.Nombre1) && !string.IsNullOrWhiteSpace(request.Apellido1)
                ? $"{char.ToUpper(request.Nombre1.Trim()[0])}{request.Apellido1.Trim()}"
                : "" ?? string.Empty;


            var usuario = new UsuarioDomain(
                0,
                request.Apellido2,
                request.Apellido1, //Doe
                request.Nombre2,
                request.Nombre1, // Jane
                nombreUsuario.ToLower(), // Aqui debe ser JDoe
                _encrypt.encryptSHA256(request.PasswordHash),
                //request.PasswordHash,
                request.Rol,
                request.Activo,
                request.FechaRegistro.ToDateTime(TimeOnly.MinValue)
            );


            var bitacora = new BitacoraDomain(
                0,
                request.UsuarioLogeado,
                $"Registro de usuario {request.Nombre1} {request.Apellido1}",
                DateTime.Now
                );
            await _repositoryBitacora.Create(bitacora);

            await _repository.Create(usuario);
            await _unitOfWork.SaveChangeAsync(cancellationToken);

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
