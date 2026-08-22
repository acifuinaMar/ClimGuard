namespace Domain.Entities.Umbral
{
    public class UmbralDomain
    {
        public int UmbralId { get; }
        public int TipoSensorId { get; }
        public decimal ValorPrecaucion { get; }
        public decimal ValorAlerta { get; }
        public decimal ValorEmergencia { get; }

        public UmbralDomain(
            int umbralId,
            int tipoSensorId,
            decimal valorPrecaucion,
            decimal valorAlerta,
            decimal valorEmergencia)
        {
            UmbralId = umbralId;
            TipoSensorId = tipoSensorId;
            ValorPrecaucion = valorPrecaucion;
            ValorAlerta = valorAlerta;
            ValorEmergencia = valorEmergencia;
        }
    }
}