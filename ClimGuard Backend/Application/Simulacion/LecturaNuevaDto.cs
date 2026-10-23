namespace Application.Simulacion
{
    public class LecturaNuevaDto
    {
        public long LecturaId { get; set; }
        public int SensorId { get; set; }
        public decimal Valor { get; set; }
        public DateTime FechaHora { get; set; }
    }
}
