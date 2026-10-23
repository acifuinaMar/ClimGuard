using Application.Sensor.Service;
using Application.Sensor.Service.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace API.Controllers
{
    [Authorize(Roles = "Operador, Administrador, Consulta")]
    [Route("api/[controller]")]
    [ApiController]
    public class SensorController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<SensorController> _logger;
        public SensorController(
            IMediator mediator,
            IHttpClientFactory httpClientFactory,
            ILogger<SensorController> logger)
        {
            _mediator = mediator;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new SensorGetAllQuery());

            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _mediator.Send(
                new SensorGetByIdQuery(id)
            );

            return Ok(result);
        }

        
    [Authorize(Roles = "Administrador")]
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateSensorCommand command)
    {
        // 1. Crear el sensor mediante la lógica existente.
        var result = await _mediator.Send(command);

        // 2. Registrar el evento de auditoría.
        try
        {
            var token = HttpContext.Request.Headers.Authorization
                .ToString()
                .Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase)
                .Trim();

            using var client = _httpClientFactory.CreateClient("AuditService");

            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                "/api/audit"
            );

            request.Headers.Authorization =
                new AuthenticationHeaderValue("Bearer", token);

            request.Content = JsonContent.Create(new
            {
                action = "SENSOR_CREATED",
                resource = "Sensor",
                detail = new
                {
                    sensorId = result.SensorId,
                    descripcion = "Sensor creado desde ClimGuard"
                }
            });

            using var response = await client.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Audit Service devolvió HTTP {StatusCode} al registrar el sensor {SensorId}",
                    (int)response.StatusCode,
                    result.SensorId
                );
            }
        }
        catch (Exception ex)
        {
            // Un fallo de auditoría no cancela la creación del sensor.
            _logger.LogWarning(
                ex,
                "No se pudo auditar la creación del sensor {SensorId}",
                result.SensorId
            );
        }

        // 3. Conservar la respuesta original.
        return CreatedAtAction(
            nameof(GetById),
            new { id = result.SensorId },
            result
        );
    }

        [HttpPost("simular")]
        public async Task<IActionResult> Simular()
        {
            var result = await _mediator.Send(
                new SimularSensoresCommand()
            );

            return Ok(result);
        }

        [Authorize(Roles = "Administrador")]
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateSensorCommand command)
        {
            var result = await _mediator.Send(command);

            return Ok(result);
        }

        //localhost:5093/api/sensor/2?usuarioLogeado=1
        //sensor/2 = el id del sensor a eliminar
        //?usuarioLogeado=1 = id del usuario quien inicio sesion
        [Authorize(Roles = "Administrador")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, [FromQuery] int usuarioLogeado)
        {
            await _mediator.Send(
                new DeleteSensorCommand(id, usuarioLogeado)
                );
            return NoContent();
        }

        //[HttpDelete("{id:int}")]
        //public async Task<IActionResult> Delete(int id, int usuarioLogeado)
        //{
        //    await _mediator.Send(
        //        new DeleteSensorCommand(id, usuarioLogeado)
        //    );

        //    return NoContent();
        //}
    }
}
