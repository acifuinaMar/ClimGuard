namespace Application.ReglaAlerta
{
    public record ReglaAlertaResultDto(
        int reglaAlertaId, 
        string nombre, 
        decimal valorMin, 
        decimal valorMax, 
        string mensaje, 
        bool activo,
        int tipoSensorId, 
        int tipoFenomenoId, 
        int nivelAlertaId, 
        int usuarioIng, 
        DateTime fechaIng, 
        int usuarioAct, 
        DateTime fechaAct
        );
}
