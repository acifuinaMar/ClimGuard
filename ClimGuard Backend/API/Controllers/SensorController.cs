using Application.Comunidad.Service;
using Application.Comunidad.Service.Queries;
using Application.Sensor.Service;
using Application.Sensor.Service.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
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

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSensorCommand command)
        {
            var result = await _mediator.Send(command);

            return Ok(result);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _mediator.Send(
                new DeleteSensorCommand(id)
            );

            return NoContent();
        }
    }
}
