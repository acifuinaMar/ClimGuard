using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class Umbral
{
    public int UmbralId { get; set; }

    public decimal? ValorAdvertencia { get; set; }

    public decimal? ValorCritico { get; set; }
}
