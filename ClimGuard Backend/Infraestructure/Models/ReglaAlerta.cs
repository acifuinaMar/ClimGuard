using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class ReglaAlerta
{
    public int ReglaAlertaId { get; set; }

    public string Nombre { get; set; } = null!;

    public decimal ValorMin { get; set; }

    public decimal ValorMax { get; set; }

    public string Mensaje { get; set; } = null!;

    public bool Activo { get; set; }

    public int TipoSensorId { get; set; }

    public int TipoFenomenoId { get; set; }

    public int NivelAlertaId { get; set; }

    public int UsuarioIng { get; set; }

    public DateTime FechaIng { get; set; }

    public int UsuarioAct { get; set; }

    public DateTime FechaAct { get; set; }

    public virtual TipoSensor TipoSensor { get; set; } = null!;

    public virtual TipoFenomeno TipoFenomeno { get; set; } = null!;

    public virtual NivelAlerta NivelAlerta { get; set; } = null!;

    public virtual ICollection<Alerta> Alerta {get; set;} = new List<Alerta>();

    public virtual Usuario? UsuarioActNavigation { get; set; }

    public virtual Usuario UsuarioIngNavigation { get; set; } = null!;
}