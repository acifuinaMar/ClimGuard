namespace ClimGuard.Domain.Entities;

/// <summary>Una medicion puntual. RN-008: siempre pertenece a un sensor.</summary>
public class Lectura
{
    public int IdLectura { get; set; }
    public int IdSensor { get; set; }
    public decimal Valor { get; set; }
    public DateTime FechaHora { get; set; }

    public Sensor? Sensor { get; set; }
}
