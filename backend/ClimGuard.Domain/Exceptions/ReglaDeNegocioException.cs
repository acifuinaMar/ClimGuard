namespace ClimGuard.Domain.Exceptions;

/// <summary>
/// Se lanza cuando se intenta violar una regla del negocio.
///
/// ¿Por qué una excepción propia y no InvalidOperationException?
/// Porque así la capa de API puede distinguirla y responder 400 (culpa del cliente)
/// en vez de 500 (culpa del servidor). Una excepción genérica no permite esa distinción.
/// </summary>
public class ReglaDeNegocioException : Exception
{
    public ReglaDeNegocioException(string mensaje) : base(mensaje) { }
}
