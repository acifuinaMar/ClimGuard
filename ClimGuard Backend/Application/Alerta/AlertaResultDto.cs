namespace Application.Alerta
{
    public record AlertaResultDto(
        int alertaId, 
        int comunidadId, 
        int sensorId, 
        int tipoFenomenoId, 
        int nivelAlertaId, 
        string mensaje, 
        DateTime fechaHora, 
        bool activa, 
        DateTime fechaResolucion
        );
}
