using Domain.Entities.User;

namespace Domain.Interfaces
{
    public interface IUsuario
    {
        Task<IReadOnlyList<UsuarioDomain>> GetAll();
        Task<UsuarioDomain> GetById(int UsuarioId);
        Task<UsuarioDomain> Create(UsuarioDomain Usuario);
        Task<bool> Update(UsuarioDomain Usuario);
        Task<bool> Delete(UsuarioDomain Usuario);
    }
}