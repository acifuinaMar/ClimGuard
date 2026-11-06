namespace Application.NivelAlerta
{
    public record NivelAlertaResultDto(
        int nivelAlertaId, 
        string nombre, 
        string colorHex,
        bool activo, 
        int usuarioIng, 
        DateTime fechaIng, 
        int? usuarioAct, 
        DateTime? fechaAct
        );
}
