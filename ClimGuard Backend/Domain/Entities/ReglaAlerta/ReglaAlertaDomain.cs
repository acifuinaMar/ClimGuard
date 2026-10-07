namespace Domain.Entities.ReglaAlerta;

public class ReglaAlertaDomain
{
    public ReglaAlertaDomain(int reglaAlertaId, string nombre, decimal valorMin, decimal valorMax, string mensaje, bool activo, 
        int tipoSensorId, int tipoFenomenoId, int nivelAlertaId, int usuarioIng, DateTime fechaIng, int usuarioAct, DateTime fechaAct)
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
        UsuarioIng = usuarioIng;
        FechaIng = fechaIng;
        UsuarioAct = usuarioAct;
        FechaAct = fechaAct;
    }

    public int ReglaAlertaId { get; set; }

    public string Nombre { get; set; } = string.Empty;

    public decimal ValorMin { get; set; }

    public decimal ValorMax { get; set; }

    public string Mensaje { get; set; } = string.Empty;

    public bool Activo { get; set; }

    public int TipoSensorId { get; set; }

    public int TipoFenomenoId { get; set; }

    public int NivelAlertaId { get; set; }

    public int UsuarioIng { get; set; }

    public DateTime FechaIng { get; set; }

    public int UsuarioAct { get; set; }

    public DateTime FechaAct { get; set; }
}