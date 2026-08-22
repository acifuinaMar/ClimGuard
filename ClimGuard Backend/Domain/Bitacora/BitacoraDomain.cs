namespace Domain.Bitacora
{
    public class BitacoraDomain
    {
        public BitacoraDomain(int bitacoraId, int usuarioId, string accion, DateTime fechaRegistro)
        {
            BitacoraId = bitacoraId;
            UsuarioId = usuarioId;
            Accion = accion;
            FechaRegistro = fechaRegistro;
        }

        public int BitacoraId { get; set; }

        public int UsuarioId { get; set; }

        public string Accion { get; set; } = string.Empty;

        public DateTime FechaRegistro { get; set; }
    }
}
