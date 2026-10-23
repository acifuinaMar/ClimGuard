namespace Domain.Interfaces
{
    public interface ISimuladorLecturas
    {
        Task GenerarLecturasAsync(CancellationToken cancellationToken);
    }
}
