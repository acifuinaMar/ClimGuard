namespace Domain.Entities.ReglaAlerta;

public class ReglaAlertaDomain
{
    public int ReglaAlertaId { get; }

    public string Nombre { get; }

    public decimal ValorMin { get; }

    public decimal ValorMax { get; }

    public string Mensaje { get; }

    public bool Activo { get; }

    public int TipoSensorId { get; }

    public int TipoFenomenoId { get; }

    public int NivelAlertaId { get; }

    public ReglaAlertaDomain(
        int reglaAlertaId,
        string nombre,
        decimal valorMin,
        decimal valorMax,
        string mensaje,
        bool activo,
        int tipoSensorId,
        int tipoFenomenoId,
        int nivelAlertaId)
    {
        ReglaAlertaId = reglaAlertaId;
        Nombre = nombre;
        ValorMin = valorMin;
        ValorMax = valorMax;
        Mensaje = mensaje;
        Activo = activo;
        TipoSensorId = tipoSensorId;
        TipoFenomenoId = tipoFenomenoId;
        NivelAlertaId = nivelAlertaId;
    }
}