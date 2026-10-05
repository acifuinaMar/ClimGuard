namespace Application.Simulacion
{
    public class AlertaNuevaDto
{
    public long AlertaId { get; set; }

    public int ComunidadId { get; set; }

    public int? SensorId { get; set; }

    public int TipoFenomenoIdSnap { get; set; }

    public int NivelAlertaIdSnap { get; set; }

    public string MensajeSnap { get; set; } = string.Empty;

    public DateTime FechaHora { get; set; }

    public bool Activo { get; set; }
}
}
