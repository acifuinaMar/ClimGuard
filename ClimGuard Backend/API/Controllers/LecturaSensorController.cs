using Application.LecturaSensor.Service;
using Application.LecturaSensor.Service.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class LecturaSensorController : ControllerBase
    {
        private readonly IMediator _mediator;

        public LecturaSensorController(IMediator mediator)
        {
            _mediator = mediator;
        }


        // GET /api/Lectura
        [HttpGet]
        public async Task<IActionResult> GetByDateRange(
            [FromQuery] int sensorId,
            [FromQuery] DateTime desde,
            [FromQuery] DateTime hasta)
        {
            var result = await _mediator.Send(
                new LecturaSensorGetByDateRangeQuery(sensorId, desde, hasta)
            );

            return Ok(result);
        }

        // GET /api/Lectura/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _mediator.Send(
                new LecturaSensorGetByIdQuery(id)
            );

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateLecturaSensorCommand command)
        {
            var result = await _mediator.Send(command);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.lecturaId },
                result
            );
        }
    }
}
