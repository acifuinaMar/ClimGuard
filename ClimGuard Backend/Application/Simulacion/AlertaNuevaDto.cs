namespace Application.Simulacion
{
    public class AlertaNuevaDto
    {
        public long AlertaId { get; set; }
        public int ComunidadId { get; set; }
        public int? SensorId { get; set; }
        public int TipoFenomenoId { get; set; }
        public int NivelAlertaId { get; set; }
        public string Mensaje { get; set; } = string.Empty;
        public DateTime FechaHora { get; set; }
        public bool Activa { get; set; }
    }
}
