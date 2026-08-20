namespace Application.LecturaSensor
{
    public record LecturaSensorResultDto(
        int lecturaId, 
        int sensorId, 
        decimal valor, 
        DateTime fechaHora
        );
}
