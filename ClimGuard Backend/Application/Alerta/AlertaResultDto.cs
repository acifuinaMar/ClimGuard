namespace Application.Alerta;

public record AlertaResultDto(
    int alertaId,
    decimal valorDetectado,
    string mensajeSnap,
    int nivelAlertaIdSnap,
    int tipoFenomenoIdSnap,
    DateTime fechaHora,
    bool activo,
    int sensorId,
    int comunidadId,
    int reglaAlertaId,
    int estadoAlertaId,
    int? usuarioResponsable
);