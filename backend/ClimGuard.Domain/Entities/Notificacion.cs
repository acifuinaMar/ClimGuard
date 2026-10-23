namespace ClimGuard.Domain.Entities;

/// <summary>Aviso de una alerta a un usuario concreto. ALT-RF-003.</summary>
public class Notificacion
{
    public int IdNotificacion { get; set; }
    public int IdUsuario { get; set; }
    public int IdAlerta { get; set; }
    public DateTime FechaEnvio { get; set; }
    public bool Leida { get; set; }

    public void MarcarLeida() => Leida = true;
}
