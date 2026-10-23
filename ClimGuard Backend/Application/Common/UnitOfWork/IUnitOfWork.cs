namespace tickets.Application.Common.UnitOfWork
{
    public interface IUnitOfWork
    {
        Task<int> SaveChangeAsync(CancellationToken cancellation = default);
        Task BeginTransactionAsync(CancellationToken cancellationToken = default);
        Task CommitTransactionAsync(CancellationToken cancellationToken = default);
        Task RollBackTransactionAsync(CancellationToken cancellationToken = default);
    }
}
