using Application.Comunidad.Service;
using Application.Sensor.Service;
using Application.Sensor.Service.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class SensorController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SensorController(IMediator mediator)
        {
            _mediator = mediator;
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
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSensorCommand command)
        {
            var result = await _mediator.Send(command);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.ComunidadId },
                result
            );
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSensorCommand command)
        {
            var result = await _mediator.Send(command);

            return Ok(result);
        }

        //localhost:5093/api/sensor/2?usuarioLogeado=1
        //sensor/2 = el id del sensor a eliminar
        //?usuarioLogeado=1 = id del usuario quien inicio sesion
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
