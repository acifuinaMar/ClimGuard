namespace Domain.Bitacora
{
    public class BitacoraDomain
    {
        public BitacoraDomain(
            long bitacoraId,
            string nombreEntidad,
            long entidadId,
            string accion,
            string descripcion,
            DateTime fechaHora,
            int usuarioId
        )
        {
            BitacoraId = bitacoraId;
            NombreEntidad = nombreEntidad;
            EntidadId = entidadId;
            Accion = accion;
            Descripcion = descripcion;
            FechaHora = fechaHora;
            UsuarioId = usuarioId;
        }

        public long BitacoraId { get; set; }

        public string NombreEntidad {get; set;}

        public long EntidadId{get; set;}

        public string Accion { get; set; } = string.Empty;

        public string Descripcion{get; set;}

        public DateTime FechaHora { get; set; }

        public int UsuarioId { get; set; }
    }
}
