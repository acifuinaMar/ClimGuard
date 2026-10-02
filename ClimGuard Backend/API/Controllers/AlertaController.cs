using Application.Alerta.Service;
using Application.Alerta.Service.Queries;
using Application.Sensor.Service;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AlertaController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AlertaController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new AlertaGetAllQuery());

            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _mediator.Send(
                new AlertaGetByIdQuery(id)
            );

            return Ok(result);
        }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AlertCreateCommand command)
        {
            var result = await _mediator.Send(command);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.alertaId },
                result
            );
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] AlertUpdateCommand command)
        {
            var result = await _mediator.Send(command);

            return Ok(result);
        }

        //localhost:5093/api/alerta/2?usuarioLogeado=1
        //alerta/2 = el id del alerta a eliminar
        //?usuarioLogeado=1 = id del usuario quien inicio sesion
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, [FromQuery] int usuarioLogeado)
        {
            await _mediator.Send(
                new AlertDeleteCommand(id, usuarioLogeado)
                );
            return NoContent();
        }

        //[HttpDelete("{id:int}")]
        //public async Task<IActionResult> Delete(int id, int usuarioLogeado)
        //{
        //    await _mediator.Send(
        //        new AlertDeleteCommand(id, usuarioLogeado)
        //    );

        //    return NoContent();
        //}
    }
}
